import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";


export default function ImpactCard({

  title,
  count,

}) {

  return (

    <View style={styles.card}>

      <Text style={styles.number}>
        {count}+
      </Text>


      <Text style={styles.title}>
        {title}
      </Text>

    </View>

  );

}


const styles = StyleSheet.create({

  card: {

    backgroundColor: "#FFFFFF",

    width: "47%",

    paddingVertical: 12,
    paddingHorizontal: 10,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 12,

    elevation: 3,

  },


  number: {

    fontSize: 20,

    fontWeight: "bold",

    color: "#2E8B57",

  },


  title: {

    fontSize: 13,

    marginTop: 5,

    textAlign: "center",

    color: "#555555",

  },

});