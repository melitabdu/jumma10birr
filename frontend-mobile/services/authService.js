import API from "./api";

export const loginAPI = async (

  phone,

  password

) => {

  const { data } = await API.post(

    "/api/users/login",

    {

      phone,

      password,

    }

  );

  return data;

};

export const registerAPI = async (

  fullName,

  phone,

  password

) => {

  const { data } = await API.post(

    "/api/users/register",

    {

      fullName,

      phone,

      password,

    }

  );

  return data;

};