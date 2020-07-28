import { useReducer, useEffect } from "react";
import axios from "axios";

const BASE_URL = `https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json`;

const ACTIONS = {
  MAKE_REQUEST: "makeRequest",
  GET_DATA: "getData",
  ERROR: "error",
  UPDATE_HAS_NEXT_PAGE: "updateHasNextPage",
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.MAKE_REQUEST:
      return { loading: true, jobs: [] };
    case ACTIONS.GET_DATA:
      return { ...state, jobs: action.payload.jobs, loading: false };
    case ACTIONS.ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        jobs: [],
      };
    case ACTIONS.UPDATE_HAS_NEXT_PAGE:
      return { ...state, hasNextPage: action.payload.hasNextPage };
    default:
      return state;
  }
};

function useFetchJobs(params, page) {
  useEffect(() => {
    const cancelToken1 = axios.CancelToken.source();
    dispatch({ type: ACTIONS.MAKE_REQUEST });
    axios
      .get(BASE_URL, {
        cancelToken: cancelToken1.token,
        params: {
          markdown: true,
          page: page,
          ...params,
        },
      })
      .then((res) => {
        dispatch({
          type: ACTIONS.GET_DATA,
          payload: {
            jobs: res.data,
          },
        });
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: err } });
      });

    const cancelToken2 = axios.CancelToken.source();
    axios
      .get(BASE_URL, {
        cancelToken: cancelToken2.token,
        params: {
          markdown: true,
          page: page,
          ...params,
        },
      })
      .then((res) => {
        dispatch({
          type: ACTIONS.UPDATE_HAS_NEXT_PAGE,
          payload: {
            hasNextPage: res.data.length !== 0,
          },
        });
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: err } });
      });

    return () => {
      cancelToken1.cancel();
      cancelToken2.cancel();
    };
  }, [params, page]);

  const initialState = { jobs: [], loading: true };
  const [state, dispatch] = useReducer(reducer, initialState);
  return state;
}

export default useFetchJobs;
