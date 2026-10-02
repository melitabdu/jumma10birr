import axios from "axios";

const API = axios.create({
  baseURL: "http://10.201.93.221:5000",
});

export default API;