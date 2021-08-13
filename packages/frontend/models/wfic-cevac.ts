/**
 * Global Data Store
 *
 * This module holds all global state. Note that most state should be local, and should not be
 * stored here. Data that cross component boundaries should be correctly siloed here.
 */
import React from "react";
import globalHook, { Store } from "use-global-hook";
import MMKVStorage from "react-native-mmkv-storage";
import Constants from "expo-constants"


export type Building = "WATT" | "COOPER" | "ASC" | "SIKES" | "FIKE";
export const BUILDINGS: Record<Building, string> = {
  WATT: "Watt Innovation Center",
  COOPER: "Cooper Library",
  ASC: "Academic Success Center",
  SIKES: "Sikes Hall",
  FIKE: "Fike Recreation Center",
};

export type Metric = "TEMP" | "CO2";
export const METRICS: Metric[] = ["TEMP", "CO2"];

export type APIResponse<T> = {
  status: "ok",
  data: T
} | {
  status: "err"
  error_message: string
}

export interface ResponseType {
  live: {
    PointSliceID: number;
    Alias: string;
    UTCDateTime: string;
    ETDateTime: string;
    ActualValue: number;
  }[],
  hist: {
    labels: number[],
    data: number[]
  },
  PXREF: {
    PointSliceID: string,
    Alias: string,
    in_xref: true
  }[],
  XREF: {
    PointSliceID: number,
    RoomType: string,
    BLG: Building,
    Floor: string,
    ReadingType: string,
    Alias: string
  }[]
}

export interface RequestParameters {
  live: {
    building: Building,
    sensor: Metric
  },
  hist: {
    building: Building,
    sensor: Metric
    id: number,
  },
  XREF: {
    building: Building,
    sensor: Metric
  },
  PXREF: {
    building: Building,
    sensor: Metric
  }
}

// Use local endpoint if given, otherwise use the real server
const url = Constants.manifest.extra?.endpoint ?? "http://fmo14.clemson.edu";

async function fetchAPI<T extends keyof ResponseType>(endpoint: T, parameters: RequestParameters[T]): Promise<ResponseType[T]> {

  // Serialize arguments
  let args: string[] = [];
  for (const [key, value] of Object.entries(parameters)) {
    args.push(encodeURIComponent(key) + "=" + encodeURIComponent(value))
  };
  
  let queryString = args.join("&");

  try {

    const response = await fetch(`${url}/${endpoint}?${queryString}`);

    const json: APIResponse<ResponseType[T]> = await response.json();


    if (json.status == "ok") {
      return Promise.resolve(json.data);
    } else {
      return Promise.reject(json.error_message);
    }

  } catch (e) {
    return Promise.reject(e);
  }

}

export interface LoadedDataEntry<T> {
  loaded: true;
  fetched: number;
  data: T;
};

export interface UnloadedDataEntry {
  loaded: false;
  loading: boolean;
  error: string | undefined;
}


export type Entry<T extends keyof ResponseType> = LoadedDataEntry<ResponseType[T]> | UnloadedDataEntry;

// Store Types
export interface GlobalState {
  // Header Settings
  header: {
    display: boolean;
    title: string;
  };

  // In-Memory Cache of fetched data
  // EVENTUAL OPTIMIZATION: Save this to storage and hydrate onload

  live: {
    [B in Building]: {
      [M in Metric]: Entry<"live">;
    };
  };

  hist: {
    [B in Building]: {
      [M in Metric]: {
        [id: number]: Entry<"hist">;
      }
    };
  }

  XREF: {
    [B in Building]: {
      [M in Metric]: Entry<"XREF">;
    };
  }

  PXREF: {
    [B in Building]: {
      [M in Metric]: Entry<"PXREF">;
    };
  }

}

export interface GlobalActions {
  setPartialState: (state: Partial<GlobalState>) => void;
  updateHeader: (display: boolean, title: string) => void;
  ensureData<T extends keyof ResponseType>(
    endpoint: T,
    parameters: RequestParameters[T],
    maximumAge: number
  ): void;
  isLoadingData<T extends keyof ResponseType>(
    endpoint: T,
    parameters: RequestParameters[T]): void;
  updateEntry<T extends keyof ResponseType>(
    endpoint: T,
    parameters: RequestParameters[T],
    entry: Entry<T>
  ): void;
  hydrate: () => void;
}

// Action Implementations

/**
 * Persistent storage for sensor data.
 **/
const MMKV = new MMKVStorage.Loader().initialize();

// The type of the persistent key in the keystore
type PersistentKey<Endpoint extends keyof ResponseType> =
  `${Endpoint}.${Building}.${Metric}${RequestParameters[Endpoint] extends { id: number } ? `.${number}` : ""}`

async function set<T extends keyof ResponseType>(key: PersistentKey<T>, value: Entry<T>): Promise<boolean | undefined> {
  console.log(`Setting ${key} to ${JSON.stringify(value)}`);
  return MMKV.setMapAsync(key, value);
}


async function get<T extends keyof ResponseType>(key: PersistentKey<T>): Promise<Entry<T> | null | undefined> {
  return MMKV.getMapAsync<Entry<T>>(key).then(v => (console.log(`GET ${key} => ${v}`), v));
}

async function hydrate(store: Store<GlobalState, GlobalActions>) {
  const keys = await MMKV.indexer.getKeys();

  console.log(`Hydrating ${keys.length} keys...`)

  // This for loop is gross, because typescript can't properly determine a different type for each
  // loop iteration. 
  for (const key of keys) {


    const [endpoint, building, sensor, id] = key.split(".") as [keyof ResponseType, Building, Metric, string | undefined];
    const entry = await get<keyof ResponseType>(key as PersistentKey<keyof ResponseType>);


    if (entry) {
      store.actions.updateEntry(endpoint, { building, sensor, id: id ? +id : undefined } as RequestParameters[keyof ResponseType], entry);
    }


  }

}



function setPartialState(
  store: Store<GlobalState, GlobalActions>,
  state: Partial<GlobalState>
) {
  store.setState({ ...store.state, ...state });
}

function updateHeader(
  store: Store<GlobalState, GlobalActions>,
  display: boolean,
  title: string
) {
  store.actions.setPartialState({
    header: {
      display,
      title,
    },
  });
}

function accessEntry<T extends keyof ResponseType>(store: Store<GlobalState, GlobalActions>, endpoint: T,
  parameters: RequestParameters[T]): Entry<T> {

  if (endpoint === "live" || endpoint === "PXREF" || endpoint === "XREF") {
    return store.state.live[parameters.building][parameters.sensor] as Entry<T>;
  } else {
    const params = parameters as RequestParameters["hist"]; // Required cast because typescript cannot determine the narrowing here
    return store.state.hist[params.building][params.sensor][params.id] as Entry<T>;
  }
};

function updateEntry<T extends keyof ResponseType>(
  store: Store<GlobalState, GlobalActions>,
  endpoint: T,
  parameters: RequestParameters[T],
  entry: Entry<T>
) {

  switch (endpoint) {
    case "live": {
      store.actions.setPartialState({
        live: {
          ...store.state.live, [parameters.building]: {
            ...store.state.live[parameters.building],
            [parameters.sensor]: entry
          }
        }
      });
      set(`live.${parameters.building}.${parameters.sensor}`, entry as Entry<"live">);
      break;
    }

    case "XREF": {
      store.actions.setPartialState({
        XREF: {
          ...store.state.XREF, [parameters.building]: {
            ...store.state.XREF[parameters.building],
            [parameters.sensor]: entry
          }
        }
      });
      set(`XREF.${parameters.building}.${parameters.sensor}`, entry as Entry<"XREF">);
      break;
    }

    case "PXREF": {
      store.actions.setPartialState({
        PXREF: {
          ...store.state.PXREF, [parameters.building]: {
            ...store.state.PXREF[parameters.building],
            [parameters.sensor]: entry
          }
        }
      });
      set(`PXREF.${parameters.building}.${parameters.sensor}`, entry as Entry<"PXREF">);
      break;
    }

    case "hist": {
      const param = parameters as RequestParameters["hist"]; // Required cast because typescript cannot determine the narrowing here
      store.actions.setPartialState({
        hist: {
          ...store.state.hist, [param.building]: {
            ...store.state.hist[param.building],
            [param.sensor]: {
              ...store.state.hist[param.building][param.sensor],
              [param.id]: entry
            }
          }
        }
      });
      set(`hist.${parameters.building}.${parameters.sensor}.${param.id}`, entry as Entry<"hist">);
      break;
    }

  }

}


function isLoadingData<T extends keyof ResponseType>(
  store: Store<GlobalState, GlobalActions>,
  endpoint: T,
  parameters: RequestParameters[T]
) {
  const entry = accessEntry(store, endpoint, parameters);

  if (entry.loaded) {
    return false;
  } else {
    return entry.loading;
  }
}

async function ensureData<T extends keyof ResponseType>(
  store: Store<GlobalState, GlobalActions>,
  endpoint: T,
  parameters: RequestParameters[T],
  maximumAge: number
) {

  // Short path, if data was fetched within maximumAge ms, immediately return
  const entry = accessEntry(store, endpoint, parameters);

  if (entry.loaded && (Date.now() - entry.fetched) < maximumAge) {
    return;
  }

  store.actions.updateEntry(endpoint, parameters, {
    loaded: false,
    loading: true,
    error: undefined,
  });

  try {
    const data = await fetchAPI(endpoint, parameters);
    store.actions.updateEntry(endpoint, parameters, {
      loaded: true,
      fetched: Date.now(),
      data,
    });
  } catch (e) {
    store.actions.updateEntry(endpoint, parameters, {
      loaded: false,
      loading: false,
      error: `${e}`,
    });
  }
}


const actions = {
  setPartialState,
  updateHeader,
  isLoadingData,
  updateEntry,
  ensureData,
  hydrate,
};

// Initial State
const initialState: GlobalState = {
  header: {
    display: true,
    title: "",
  },
  live: {
    WATT: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    COOPER: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    ASC: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    FIKE: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    SIKES: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
  },
  hist: {
    WATT: {
      TEMP: {

      },
      CO2: {

      },
    },
    COOPER: {
      TEMP: {

      },
      CO2: {

      },
    },
    ASC: {
      TEMP: {

      },
      CO2: {

      },
    },
    FIKE: {
      TEMP: {

      },
      CO2: {

      },
    },
    SIKES: {
      TEMP: {

      },
      CO2: {

      },
    },
  },
  XREF: {
    WATT: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    COOPER: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    ASC: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    FIKE: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    SIKES: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
  },
  PXREF: {
    WATT: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    COOPER: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    ASC: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    FIKE: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
    SIKES: {
      TEMP: {
        loaded: false,
        loading: false,
        error: undefined,
      },
      CO2: {
        loaded: false,
        loading: false,
        error: undefined,
      },
    },
  },
};

const useGlobal = globalHook<GlobalState, GlobalActions>(
  React,
  initialState,
  actions
);

export default useGlobal;
