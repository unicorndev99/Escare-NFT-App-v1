import { BASE_URL } from "../constants/config";

export const buildUrl = (path, params) =>
  `${BASE_URL}${path}?${params.toString()}`;
