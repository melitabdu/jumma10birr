import React,{useState} from "react";

import{

View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert,
ActivityIndicator,

} from "react-native";

import {useAuth} from "../context/AuthContext";

export default function RegisterScreen({navigation}){

const{registerUser}=useAuth();

const[fullName,setFullName]=useState("");

const[phone,setPhone]=useState("");

const[password,setPassword]=useState("");

const[confirmPassword,setConfirmPassword]=useState("");

const[loading,setLoading]=useState(false);

const register=async()=>{

if(fullName===""){

Alert.alert("Enter your name");

return;

}

if(!/^09\d{8}$/.test(phone)){

Alert.alert("Invalid phone");

return;

}

if(password!==confirmPassword){

Alert.alert("Passwords do not match");

return;

}

try{

setLoading(true);

const user=await registerUser(

fullName,

phone,

password

);

Alert.alert(

"Success",

`Welcome ${user.fullName}`

);

navigation.replace("MainTabs");

}

catch(error){

Alert.alert(

"Registration Failed",

error.response?.data?.message||

error.message

);

}

setLoading(false);

};

return(

<View style={styles.container}>

<Text style={styles.title}>

Create Account

</Text>

<TextInput

placeholder="Full Name"

style={styles.input}

value={fullName}

onChangeText={setFullName}

/>

<TextInput

placeholder="09XXXXXXXX"

keyboardType="phone-pad"

style={styles.input}

value={phone}

onChangeText={setPhone}

/>

<TextInput

placeholder="Password"

secureTextEntry

style={styles.input}

value={password}

onChangeText={setPassword}

/>

<TextInput

placeholder="Confirm Password"

secureTextEntry

style={styles.input}

value={confirmPassword}

onChangeText={setConfirmPassword}

/>

<TouchableOpacity

style={styles.button}

onPress={register}

>

{

loading?

<ActivityIndicator color="#fff"/>

:

<Text style={styles.buttonText}>

Create Account

</Text>

}

</TouchableOpacity>

<TouchableOpacity

onPress={()=>navigation.goBack()}

>

<Text style={styles.link}>

Already have an account?

<Text style={{fontWeight:"bold"}}>

 Login

</Text>

</Text>

</TouchableOpacity>

</View>

);

}

const styles=StyleSheet.create({

container:{
flex:1,
justifyContent:"center",
padding:25,
backgroundColor:"#F8F9FA",
},

title:{
fontSize:30,
fontWeight:"bold",
textAlign:"center",
color:"#2E8B57",
marginBottom:30,
},

input:{
backgroundColor:"#fff",
padding:15,
borderRadius:12,
marginBottom:15,
fontSize:16,
},

button:{
backgroundColor:"#2E8B57",
padding:16,
borderRadius:30,
alignItems:"center",
marginTop:10,
},

buttonText:{
color:"#fff",
fontSize:18,
fontWeight:"bold",
},

link:{
marginTop:25,
textAlign:"center",
fontSize:16,
},

});