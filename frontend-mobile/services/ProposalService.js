import API from "./api";


export const getProjects = async()=>{


try{


const response = await API.get(

"/api/proposals/ongoing"

);


return(

response.data.proposals

|| []

);


}


catch(error){


console.log(

error.message

);


return [];


}


};