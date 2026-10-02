import React from "react";

import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function AboutScreen() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >

      {/* ================= HERO ================= */}

      <View style={styles.hero}>

        <Text style={styles.heroTitle}>
          የኢትዮጵያ እስልምና ጉዳዮች{"\n"}
          ጠቅላይ ምክር ቤት
        </Text>

        <Text style={styles.heroText}>
          ከአንድ ግማሽ ሞዕተ ዐመት በላይ የሙስሊም ማህበረሰብን
          በመንፈሳዊ፣ በማህበራዊና በኢኮኖሚያዊ ዘርፎች
          በተከታታይ ሲያገለግል የቆየ ተቋም።
        </Text>

      </View>

      {/* ================= HISTORY ================= */}

      <View style={styles.card}>

        <Text style={styles.heading}>
          መጀመሪያና መሠረት
        </Text>

        <Text style={styles.text}>
          የኢትዮጵያ ሙስሊሞች በ1966 ዓ.ም ባካሄዱት ተእይንተ ህዝብ
          ማግስት፣ በመጋቢት 28 ቀን 1967 ዓ.ም
          የኢትዮጵያ እስልምና ከፍተኛ ምክር ቤት
          በይፋ ተመሰረተ።
        </Text>

        <Text style={styles.text}>
          በአዋጅ 1207/2012 የህጋዊ ሰውነት ማረጋገጫ
          ካገኘ በኋላ አደረጃጀቱንና አሰራሩን
          በማሻሻል ዘርፈ ብዙ አገልግሎቶችን
          እየሰጠ ይገኛል።
        </Text>

      </View>

      {/* ================= VISION ================= */}

      <View style={styles.card}>

        <Text style={styles.heading}>
          ተቋማዊ ራእይ
        </Text>

        <Text style={styles.text}>
          አንድነቱ ተጠብቆ፣
          ኢስላምን የሚኖር፣
          ንቁ ኢትዮጵያዊ ሙስሊም
          ማህበረሰብ መፍጠር።
        </Text>

      </View>

      {/* ================= MISSION ================= */}

      <View style={styles.card}>

        <Text style={styles.heading}>
          ተቋማዊ ተልዕኮ
        </Text>

        <Text style={styles.text}>
          በኢስላማዊ አስተምህሮት
          መሠረት ያደረገ፣
          ዘመናዊ የአስተዳደር
          ሥርዓት በመዘርጋት
          የበለፀገ ማህበረሰብ
          መፍጠር።
        </Text>

      </View>

      {/* ================= ACTIVITIES ================= */}

      <View style={styles.card}>

        <Text style={styles.heading}>
          እየተካናወኑ ያሉ ተግባራት
        </Text>

        <Text style={styles.list}>• ሀጅና ዑምራ አገልግሎቶች</Text>
        <Text style={styles.list}>• የዳዕዋ ስራዎች</Text>
        <Text style={styles.list}>• የሃላል አገልግሎቶች</Text>
        <Text style={styles.list}>• መስጅዶችና መድረሳዎች</Text>
        <Text style={styles.list}>• ኢስላማዊ ጥናትና ምርምር</Text>
        <Text style={styles.list}>• የጀናዛ ማዕከላት</Text>
        <Text style={styles.list}>• የወጣቶችና የሴቶች ማህበራት</Text>
        <Text style={styles.list}>• ለችግር የተጋለጡ ወገኖች ድጋፍ</Text>

      </View>

      {/* ================= CALL TO ACTION ================= */}

      <View style={styles.cta}>

        <Text style={styles.ctaTitle}>
          ተልእኳችንን ያግዙ
        </Text>

        <Text style={styles.ctaText}>
          በአላህ መንገድ ላይ
          የሚደረግ ሰደቃ
          ዘላቂ ተፅዕኖ ይፈጥራል።
          እርስዎም በአቅምዎ
          መጠን በዚህ
          የሀይር ስራ
          ተሳትፈው
          አሻራዎን ያስቀምጡ።
        </Text>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F9F8",
  },

  hero: {
    backgroundColor: "#2E8B57",
    padding: 30,
    alignItems: "center",
  },

  heroTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },

  heroText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginTop: 18,
    padding: 20,
    borderRadius: 18,
    elevation: 4,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E8B57",
    marginBottom: 15,
  },

  text: {
    fontSize: 16,
    lineHeight: 28,
    color: "#555",
    marginBottom: 10,
  },

  list: {
    fontSize: 16,
    color: "#444",
    marginBottom: 10,
  },

  cta: {
    backgroundColor: "#2E8B57",
    margin: 20,
    padding: 25,
    borderRadius: 20,
    marginBottom: 40,
  },

  ctaTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },

  ctaText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 28,
  },

});