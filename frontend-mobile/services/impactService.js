import API from "./api";


export const getImpact = async () => {

  try {

    const response = await API.get("/api/impact");

    console.log("Response =", response.data);

    return response.data;

  }

  catch (error) {

    console.log("Impact Error =");

    console.log(error.message);

    console.log(error.response?.data);

    return [];

  }

};