import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {

  const { loginUser } = useAuth();

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {

    if (!/^09\d{8}$/.test(phone)) {

      Alert.alert(
        "Invalid Phone",
        "Enter a valid Ethiopian phone number."
      );

      return;

    }

    if (password.length < 6) {

      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters."
      );

      return;

    }

    try {

      setLoading(true);

      const user = await loginUser(phone, password);

      Alert.alert(
        "Welcome",
        `Welcome ${user.fullName}`
      );

      navigation.replace("MainTabs");

    } catch (error) {

      Alert.alert(
        "Login Failed",
        error.response?.data?.message ||
          error.message
      );

    }

    setLoading(false);

  };

  return (

<View style={styles.container}>

<Text style={styles.logo}>
🌙
</Text>

<Text style={styles.title}>
10 Birr in Jumma
</Text>

<Text style={styles.subtitle}>
Welcome Back
</Text>

<TextInput
placeholder="09XXXXXXXX"
keyboardType="phone-pad"
style={styles.input}
value={phone}
onChangeText={setPhone}
/>

<View style={styles.passwordContainer}>

<TextInput
placeholder="Password"
secureTextEntry={!showPassword}
style={styles.passwordInput}
value={password}
onChangeText={setPassword}
/>

<TouchableOpacity
onPress={() =>
setShowPassword(!showPassword)
}
>

<Ionicons
name={
showPassword
? "eye"
: "eye-off"
}
size={22}
color="gray"
/>

</TouchableOpacity>

</View>

<TouchableOpacity
style={styles.button}
onPress={handleLogin}
disabled={loading}
>

{loading ?

<ActivityIndicator color="#fff"/>

:

<Text style={styles.buttonText}>
Login
</Text>

}

</TouchableOpacity>

<TouchableOpacity>

<Text style={styles.forgot}>
Forgot Password?
</Text>

</TouchableOpacity>

<TouchableOpacity
onPress={()=>
navigation.navigate("Register")
}
>

<Text style={styles.link}>

Don't have an account?

<Text style={{fontWeight:"bold"}}>

 Create One

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

logo:{
fontSize:60,
textAlign:"center",
},

title:{
fontSize:30,
fontWeight:"bold",
textAlign:"center",
color:"#2E8B57",
},

subtitle:{
fontSize:18,
textAlign:"center",
marginBottom:35,
marginTop:5,
},

input:{
backgroundColor:"#fff",
padding:15,
borderRadius:12,
marginBottom:15,
fontSize:16,
},

passwordContainer:{
backgroundColor:"#fff",
borderRadius:12,
paddingHorizontal:15,
flexDirection:"row",
alignItems:"center",
marginBottom:20,
},

passwordInput:{
flex:1,
paddingVertical:15,
},

button:{
backgroundColor:"#2E8B57",
padding:16,
borderRadius:30,
alignItems:"center",
},

buttonText:{
color:"#fff",
fontSize:18,
fontWeight:"bold",
},

forgot:{
textAlign:"center",
marginTop:20,
color:"#2E8B57",
},

link:{
marginTop:25,
textAlign:"center",
fontSize:16,
},

});