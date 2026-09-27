import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LocationCard } from './components/LocationCard';
import { ShelterInputsForm } from './components/ShelterInputsForm';
import { ComfortMetrics } from './components/ComfortMetrics';
import { ThermalGraphs } from './components/ThermalGraphs';
import { Shelter3DViewer } from './components/Shelter3DViewer';
import { BaselineComparison } from './components/BaselineComparison';
import { OptimizerCard } from './components/OptimizerCard';
import { EngineeringDisclaimer } from './components/EngineeringDisclaimer';

import type {
  ShelterInputs,
  ClimateLocation,
  SimulationResponse,
  BaselineComparisonResponse,
  OptimizationResponse,
} from './types/shelter';

import { AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_LEH_INPUTS: ShelterInputs = {
  length_m: 6.0,
  width_m: 4.0,
  height_m: 2.8,
  orientation: 'South',
  insulation_thickness_mm: 100.0,
  window_wall_ratio_pct: 15.0,
  material: 'Insulated Sandwich Panel',
  thermal_mass: 'High',
  occupants: 4,
};

export function App() {
  const [locations, setLocations] = useState<ClimateLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] =
    useState<string>('leh');

  const [currentClimate, setCurrentClimate] =
    useState<ClimateLocation | null>(null);

  const [inputs, setInputs] =
    useState<ShelterInputs>(DEFAULT_LEH_INPUTS);

  const [simulationData, setSimulationData] =
    useState<SimulationResponse | null>(null);

  const [comparisonData, setComparisonData] =
    useState<BaselineComparisonResponse | null>(null);

  const [optimizerData, setOptimizerData] =
    useState<OptimizationResponse | null>(null);

  const [isSimulating, setIsSimulating] =
    useState<boolean>(false);

  const [activeTab, setActiveTab] =
    useState<'simulation' | 'optimizer' | 'comparison'>(
      'simulation'
    );

  const [errorMsg, setErrorMsg] =
    useState<string | null>(null);


  // =========================================================
  // FETCH AVAILABLE CLIMATE LOCATIONS
  // =========================================================

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.locations && data.locations.length > 0) {
          setLocations(data.locations);

          const lehLoc = data.locations.find(
            (l: any) => l.id === 'leh'
          );

          if (lehLoc) {
            setCurrentClimate(lehLoc);
          }
        }
      })
      .catch((err) => {
        console.error(
          'Failed to load locations from API:',
          err
        );

        // Fallback default locations
        setLocations([
          {
            id: 'leh',
            name: 'Leh, Ladakh',
            region:
              'Trans-Himalayas (Extreme Cold High-Altitude)',
            altitude_m: 3500,
            temp_min: -15.0,
            temp_max: 2.0,
            peak_solar_wm2: 950.0,
            data_source_label: 'Demo Climate Data',
          },

          {
            id: 'thar',
            name: 'Thar Desert, Rajasthan',
            region: 'Western Arid Zone',
            altitude_m: 220,
            temp_min: 27.5,
            temp_max: 44.5,
            peak_solar_wm2: 910.0,
            data_source_label: 'Demo Climate Data',
          },

          {
            id: 'delhi',
            name: 'Delhi (NCR)',
            region: 'Northern Plains',
            altitude_m: 216,
            temp_min: 22.0,
            temp_max: 38.0,
            peak_solar_wm2: 820.0,
            data_source_label: 'Demo Climate Data',
          },
        ]);
      });
  }, []);


  // =========================================================
  // THERMAL SIMULATION
  // =========================================================

  const handleSimulate = async (
    locId = selectedLocationId,
    params = inputs
  ) => {
    setIsSimulating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          location_id: locId,
          shelter_inputs: params,
        }),
      });

      if (!res.ok) {
        throw new Error('Simulation failed');
      }

      const data: SimulationResponse =
        await res.json();

      setSimulationData(data);

    } catch (err: any) {
      console.error(err);

      setErrorMsg(
        'Failed to run simulation. Ensure backend Python server is running at http://localhost:8000.'
      );

    } finally {
      setIsSimulating(false);
    }
  };


  // =========================================================
  // INITIAL SIMULATION
  // =========================================================

  useEffect(() => {
    handleSimulate(
      'leh',
      DEFAULT_LEH_INPUTS
    );
  }, []);


  // =========================================================
  // LOCATION CHANGE
  // =========================================================

  const handleLocationChange = (
    newLocId: string
  ) => {
    setSelectedLocationId(newLocId);

    const locObj =
      locations.find(
        (l) => l.id === newLocId
      ) || null;

    setCurrentClimate(locObj);

    // Old results are no longer valid for a new location.
    setComparisonData(null);
    setOptimizerData(null);

    handleSimulate(
      newLocId,
      inputs
    );
  };


  // =========================================================
  // OPTIMIZATION
  // =========================================================

  const handleOptimize = async () => {
    setIsSimulating(true);
    setErrorMsg(null);
    setActiveTab('optimizer');

    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          location_id: selectedLocationId,
          shelter_inputs: inputs,
        }),
      });

      if (!res.ok) {
        throw new Error(
          'Optimization search failed'
        );
      }

      const data: OptimizationResponse =
        await res.json();

      setOptimizerData(data);

    } catch (err: any) {
      console.error(err);

      setErrorMsg(
        'Failed to run optimization search.'
      );

    } finally {
      setIsSimulating(false);
    }
  };


  // =========================================================
  // BASELINE VS IMPROVED COMPARISON
  // =========================================================

  const handleCompare = async () => {
    setIsSimulating(true);
    setErrorMsg(null);
    setActiveTab('comparison');

    try {

      /*
       * IMPORTANT:
       *
       * If an optimizer result exists, use its actual
       * recommendation for the comparison.
       *
       * This keeps:
       *
       * Optimizer
       *      ↓
       * Apply / Compare
       *      ↓
       * Baseline vs Improved
       *
       * consistent.
       */

      const optimizerRecommendation =
        (optimizerData as any)?.recommendation;

      const compareInputs: ShelterInputs =
        optimizerRecommendation?.inputs || inputs;

      console.log(
        'Comparison configuration being sent:',
        compareInputs
      );


      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          location_id: selectedLocationId,
          shelter_inputs: compareInputs,
        }),
      });


      if (!res.ok) {
        throw new Error(
          'Comparison failed'
        );
      }


      const data: BaselineComparisonResponse =
        await res.json();


      console.log(
        'Fresh comparison response:',
        data
      );


      // Always replace the old comparison result.
      setComparisonData(data);

    } catch (err: any) {
      console.error(err);

      setErrorMsg(
        'Failed to run baseline comparison.'
      );

    } finally {
      setIsSimulating(false);
    }
  };


  // =========================================================
  // RESET LEH DEFAULTS
  // =========================================================

  const handleResetLehDefaults = () => {
    setInputs(DEFAULT_LEH_INPUTS);

    setSelectedLocationId('leh');

    // Clear results based on previous configuration.
    setComparisonData(null);
    setOptimizerData(null);

    handleSimulate(
      'leh',
      DEFAULT_LEH_INPUTS
    );
  };


  // =========================================================
  // APPLY OPTIMIZER RECOMMENDATION
  // =========================================================

  const handleApplyCandidate = (
    candInputs: ShelterInputs
  ) => {

    // Apply recommended configuration.
    setInputs(candInputs);

    // The old comparison is no longer valid.
    setComparisonData(null);

    // Run thermal simulation using the recommendation.
    handleSimulate(
      selectedLocationId,
      candInputs
    );

    // Return to simulation.
    setActiveTab('simulation');
  };


  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <Header />


      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">


        {/* =================================================
            ERROR ALERT
        ================================================== */}

        {errorMsg && (

          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-center justify-between">

            <div className="flex items-center space-x-3">

              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />

              <span className="text-xs font-mono">
                {errorMsg}
              </span>

            </div>


            <button
              onClick={() =>
                handleSimulate()
              }

              className="bg-rose-900 hover:bg-rose-800 text-white text-xs px-3 py-1 rounded font-mono flex items-center space-x-1"
            >

              <RefreshCw className="w-3.5 h-3.5" />

              <span>
                Retry
              </span>

            </button>

          </div>

        )}


        {/* =================================================
            LOCATION ENVIRONMENT
        ================================================== */}

        <LocationCard
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={handleLocationChange}
          currentClimate={currentClimate}
        />


        {/* =================================================
            SHELTER INPUTS + 3D VIEWER
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-7">

            <ShelterInputsForm

              inputs={inputs}

              onChange={(newInputs) => {

                // Update current design.
                setInputs(newInputs);

                /*
                 * IMPORTANT:
                 *
                 * The user manually changed the design,
                 * therefore old optimization and comparison
                 * results no longer represent the current design.
                 */

                setComparisonData(null);
                setOptimizerData(null);
              }}

              onResetLehDefaults={
                handleResetLehDefaults
              }

              onSimulate={() => {

                setActiveTab('simulation');

                handleSimulate(
                  selectedLocationId,
                  inputs
                );

              }}

              onOptimize={
                handleOptimize
              }

              onCompare={
                handleCompare
              }

              isSimulating={
                isSimulating
              }

            />

          </div>


          <div className="lg:col-span-5">

            <Shelter3DViewer

              inputs={inputs}

              maxIndoorTemp={
                simulationData?.metrics
                  ?.max_indoor_temp
              }

            />

          </div>

        </div>


        {/* =================================================
            RESULTS NAVIGATION TABS
        ================================================== */}

        <div className="flex border-b border-slate-800 space-x-4 pt-2">


          {/* =================================================
              SIMULATION TAB
          ================================================== */}

          <button

            onClick={() =>
              setActiveTab('simulation')
            }

            className={`pb-3 text-xs font-bold font-mono tracking-wider transition border-b-2 cursor-pointer ${activeTab === 'simulation'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >

            THERMAL SIMULATION & COMFORT

          </button>


          {/* =================================================
              OPTIMIZER TAB
          ================================================== */}

          <button

            onClick={() => {

              if (!optimizerData) {
                handleOptimize();
              } else {
                setActiveTab('optimizer');
              }

            }}

            className={`pb-3 text-xs font-bold font-mono tracking-wider transition border-b-2 cursor-pointer ${activeTab === 'optimizer'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >

            PROTOTYPE OPTIMIZATION & RECOMMENDATION

          </button>


          {/* =================================================
              COMPARISON TAB
              
              IMPORTANT FIX:
              ALWAYS FETCH FRESH DATA
          ================================================== */}

          <button

            onClick={() => {
              handleCompare();
            }}

            className={`pb-3 text-xs font-bold font-mono tracking-wider transition border-b-2 cursor-pointer ${activeTab === 'comparison'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >

            BASELINE VS IMPROVED COMPARISON

          </button>

        </div>


        {/* =================================================
            TAB 1 — THERMAL SIMULATION
        ================================================== */}

        {activeTab === 'simulation' && (

          <div className="space-y-6">

            <ComfortMetrics
              metrics={
                simulationData?.metrics || null
              }
            />

            <ThermalGraphs
              hourlyData={
                simulationData?.hourly_results || []
              }
            />

          </div>

        )}


        {/* =================================================
            TAB 2 — PROTOTYPE OPTIMIZATION
        ================================================== */}

        {activeTab === 'optimizer' && (

          <div className="space-y-6">

            <OptimizerCard

              data={optimizerData}

              onApplyCandidate={
                handleApplyCandidate
              }

            />

          </div>

        )}


        {/* =================================================
            TAB 3 — BASELINE COMPARISON
        ================================================== */}

        {activeTab === 'comparison' && (

          <div className="space-y-6">

            <BaselineComparison
              data={comparisonData}
            />

          </div>

        )}

      </main>


      {/* =====================================================
          ENGINEERING DISCLAIMER
      ====================================================== */}

      <EngineeringDisclaimer />

    </div>
  );
}


export default App;