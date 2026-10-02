// screens/DonateScreen.js

import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  TextInput,
  Switch,
  Alert,
} from "react-native";


const VIDEO_URL =
  "https://www.youtube.com/watch?v=Mr5v34qtYFs";


const VIDEO_THUMBNAIL =
  "https://img.youtube.com/vi/Mr5v34qtYFs/maxresdefault.jpg";


// Temporary data
// Later this will come from backend

const supportProjects = [

  {
    id:1,
    title:"Mosque Construction",
    description:
    "Support building and maintaining mosques for communities.",
    image:
    "https://via.placeholder.com/300",
  },


  {
    id:2,
    title:"Quran Education",
    description:
    "Help provide Islamic education for children and youth.",
    image:
    "https://via.placeholder.com/300",
  },


  {
    id:3,
    title:"Food Assistance",
    description:
    "Provide food support for families in need.",
    image:
    "https://via.placeholder.com/300",
  },


  {
    id:4,
    title:"Water Projects",
    description:
    "Support clean water projects for communities.",
    image:
    "https://via.placeholder.com/300",
  },

];



const donationTypes=[

 {
  title:"Sadaqah",
  description:
  "Voluntary charity that creates continuous reward."
 },

 {
  title:"Zakat",
  description:
  "Support eligible people through proper Zakat distribution."
 },

 {
  title:"Waqf",
  description:
  "Create a lasting charity through permanent projects."
 },

 {
  title:"Fidyah & Kaffarah",
  description:
  "Support those in need through religious obligations."
 },

];



export default function DonateScreen(){


const [selectedType,setSelectedType]=useState("Sadaqah");


const [selectedAmount, setSelectedAmount] = useState(10);


const [customAmount, setCustomAmount] = useState("");


const [weeklyDonation, setWeeklyDonation] = useState(true);

const openVideo=()=>{

 Linking.openURL(VIDEO_URL);

};



return (

<ScrollView

showsVerticalScrollIndicator={false}

style={styles.container}

>


{/* ================= HERO ================= */}


<View style={styles.hero}>


<Text style={styles.heroTitle}>

10 Birr in Jumma

</Text>



<Text style={styles.heroSubtitle}>

A small donation every Friday can create
a lasting impact in our communities.

</Text>


<TouchableOpacity

style={styles.heroButton}

>

<Text style={styles.heroButtonText}>

Donate Now

</Text>


</TouchableOpacity>


</View>





{/* ================= VIDEO ================= */}


<Text style={styles.sectionTitle}>

Message from EIASC

</Text>



<TouchableOpacity

style={styles.videoCard}

onPress={openVideo}

>


<Image

source={{
uri:VIDEO_THUMBNAIL
}}

style={styles.videoImage}

/>


<View style={styles.playButton}>

<Text style={styles.playIcon}>

▶

</Text>

</View>



</TouchableOpacity>



<Text style={styles.centerText}>

Tap to watch our official message

</Text>





{/* ================= PROJECTS ================= */}



<Text style={styles.sectionTitle}>

Projects Needing Support

</Text>



<ScrollView

horizontal

showsHorizontalScrollIndicator={false}

>


{
supportProjects.map((project)=>(


<View

key={project.id}

style={styles.projectCard}

>


<Image

source={{
uri:project.image
}}

style={styles.projectImage}

/>



<Text style={styles.projectTitle}>

{project.title}

</Text>



<Text style={styles.projectDescription}>

{project.description}

</Text>



<TouchableOpacity

style={styles.smallDonateButton}

>

<Text style={styles.smallDonateText}>

Support

</Text>

</TouchableOpacity>


</View>


))

}



</ScrollView>






{/* ================= WHY DONATE ================= */}



<Text style={styles.sectionTitle}>

Why Your Donation Matters

</Text>



<View style={styles.infoCard}>


<Text style={styles.infoItem}>

🕌 Build and maintain mosques

</Text>


<Text style={styles.infoItem}>

📖 Support Islamic education

</Text>


<Text style={styles.infoItem}>

🤲 Help needy families

</Text>


<Text style={styles.infoItem}>

🍚 Provide food assistance

</Text>


<Text style={styles.infoItem}>

💧 Support community projects

</Text>



</View>






{/* ================= DONATION TYPES ================= */}



<Text style={styles.sectionTitle}>

Choose Donation Type

</Text>




{
donationTypes.map((item)=>(


<TouchableOpacity

key={item.title}

style={[

styles.typeCard,

selectedType===item.title &&
styles.selectedType

]}


onPress={()=>setSelectedType(item.title)}

>


<Text style={styles.typeTitle}>

{item.title}

</Text>



<Text style={styles.typeDescription}>

{item.description}

</Text>



</TouchableOpacity>


))

}
// ================= DONATION AMOUNT =================


<Text style={styles.sectionTitle}>

Choose Amount

</Text>



<View style={styles.amountContainer}>


{
[10,25,50,100,250,500].map((item)=>(


<TouchableOpacity

key={item}

style={[

styles.amountButton,

selectedAmount===item &&
styles.selectedAmount

]}


onPress={()=>setSelectedAmount(item)}

>


<Text

style={[

styles.amountText,

selectedAmount===item &&
styles.selectedAmountText

]}

>

{item} Birr

</Text>


</TouchableOpacity>


))

}


</View>





<TextInput

style={styles.input}

keyboardType="numeric"

placeholder="Custom amount"

value={customAmount}

onChangeText={(value)=>{

setCustomAmount(value);

setSelectedAmount(Number(value));

}}

/>





{/* ================= RECURRING ================= */}



<View style={styles.recurringCard}>


<Text style={styles.recurringText}>

Donate every Friday

</Text>



<Switch

value={weeklyDonation}

onValueChange={setWeeklyDonation}

/>



</View>






{/* ================= DONATE BUTTON ================= */}



<TouchableOpacity

style={styles.mainDonateButton}

onPress={()=>{


Alert.alert(

"Donation",

`Continue with ${selectedAmount} Birr donation using TellBirr`

);


}}

>


<Text style={styles.mainDonateText}>

Donate using TellBirr

</Text>


</TouchableOpacity>





<Text style={styles.paymentNote}>

Secure payment through TellBirr.
Your generosity supports communities across Ethiopia.

</Text>






{/* ================= FINAL MESSAGE ================= */}



<View style={styles.finalCard}>


<Text style={styles.finalText}>

"Whoever saves one life, it is as if they have saved all mankind."

</Text>



<Text style={styles.finalArabic}>

May Allah accept your charity.

</Text>


</View>






</ScrollView>


);

}




// ================= STYLES =================



const styles = StyleSheet.create({



container:{

flex:1,

backgroundColor:"#F7F9F8",

padding:20,

},




// HERO

hero:{

backgroundColor:"#2E8B57",

padding:25,

borderRadius:25,

alignItems:"center",

marginTop:20,

},


heroTitle:{

fontSize:32,

fontWeight:"bold",

color:"#FFFFFF",

textAlign:"center",

},


heroSubtitle:{

fontSize:16,

color:"#FFFFFF",

textAlign:"center",

marginTop:10,

lineHeight:23,

},


heroButton:{

backgroundColor:"#FFFFFF",

paddingVertical:14,

paddingHorizontal:40,

borderRadius:30,

marginTop:20,

},


heroButtonText:{

color:"#2E8B57",

fontSize:18,

fontWeight:"bold",

},






// SECTION


sectionTitle:{

fontSize:23,

fontWeight:"bold",

color:"#2E8B57",

marginTop:30,

marginBottom:15,

},





// VIDEO


videoCard:{

height:220,

borderRadius:20,

overflow:"hidden",

backgroundColor:"#ddd",

},


videoImage:{

width:"100%",

height:"100%",

},


playButton:{

position:"absolute",

top:"40%",

left:"42%",

width:65,

height:65,

borderRadius:35,

backgroundColor:"rgba(0,0,0,0.6)",

justifyContent:"center",

alignItems:"center",

},


playIcon:{

fontSize:30,

color:"#fff",

},


centerText:{

textAlign:"center",

marginTop:10,

color:"#777",

},






// PROJECTS


projectCard:{

width:260,

backgroundColor:"#fff",

padding:15,

borderRadius:20,

marginRight:15,

elevation:4,

},


projectImage:{

height:130,

borderRadius:15,

},


projectTitle:{

fontSize:18,

fontWeight:"bold",

marginTop:12,

},


projectDescription:{

color:"#666",

marginTop:8,

lineHeight:20,

},


smallDonateButton:{

backgroundColor:"#2E8B57",

padding:10,

borderRadius:20,

marginTop:15,

alignItems:"center",

},


smallDonateText:{

color:"#fff",

fontWeight:"bold",

},






// INFO


infoCard:{

backgroundColor:"#fff",

padding:20,

borderRadius:20,

},


infoItem:{

fontSize:16,

marginBottom:15,

},






// TYPES


typeCard:{

backgroundColor:"#fff",

padding:18,

borderRadius:18,

marginBottom:12,

},


selectedType:{

borderWidth:2,

borderColor:"#2E8B57",

},


typeTitle:{

fontSize:18,

fontWeight:"bold",

color:"#2E8B57",

},


typeDescription:{

marginTop:8,

color:"#666",

},





// AMOUNT


amountContainer:{

flexDirection:"row",

flexWrap:"wrap",

justifyContent:"space-between",

},


amountButton:{

width:"30%",

backgroundColor:"#fff",

padding:15,

borderRadius:15,

alignItems:"center",

marginBottom:12,

},


selectedAmount:{

backgroundColor:"#2E8B57",

},


amountText:{

fontWeight:"bold",

},


selectedAmountText:{

color:"#fff",

},



input:{

backgroundColor:"#fff",

padding:15,

borderRadius:15,

marginTop:10,

},






// RECURRING


recurringCard:{

backgroundColor:"#fff",

padding:20,

borderRadius:20,

flexDirection:"row",

justifyContent:"space-between",

alignItems:"center",

marginTop:20,

},


recurringText:{

fontSize:17,

fontWeight:"bold",

},






// BUTTON


mainDonateButton:{

backgroundColor:"#2E8B57",

padding:18,

borderRadius:35,

alignItems:"center",

marginTop:30,

},


mainDonateText:{

color:"#fff",

fontSize:20,

fontWeight:"bold",

},



paymentNote:{

textAlign:"center",

color:"#777",

marginTop:15,

},





// FINAL


finalCard:{

backgroundColor:"#E8F5E9",

padding:25,

borderRadius:20,

marginTop:30,

marginBottom:40,

},


finalText:{

fontSize:17,

fontStyle:"italic",

textAlign:"center",

color:"#444",

},


finalArabic:{

textAlign:"center",

marginTop:15,

fontWeight:"bold",

color:"#2E8B57",

},


});

