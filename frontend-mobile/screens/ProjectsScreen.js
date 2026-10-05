import React,{
useState,
useEffect,
} from "react";


import{
View,
Text,
StyleSheet,
ScrollView,
} from "react-native";


import ProjectsCard from
"../components/home/ProjectCard";


import{getProjects} from "../services/ProposalService";


export default function ProjectsScreen({

navigation,

}){


const[projects,setProjects]=useState([]);



useEffect(()=>{

fetchProjects();

},[]);



const fetchProjects = async()=>{


const data = await getProjects();

setProjects(data);


};



return(


<ScrollView>

<View style={styles.container}>


<Text style={styles.heading}>

Our Projects

</Text>



{

projects.length===0 ?(

<Text>

No Projects Available.

</Text>


):(


projects.map((project)=>(


<ProjectsCard

key={project._id}

title={project.title}

description={project.description}

progress={project.progress}

project={project}

navigation={navigation}

/>


))


)


}



</View>


</ScrollView>


);


}



const styles=StyleSheet.create({


container:{

flex:1,

padding:20,

},


heading:{

fontSize:30,

fontWeight:"bold",

marginBottom:25,

color:"#2E8B57",

textAlign:"center",

},


});