import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Dimensions,  } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { auth, db } from '../firebase';

const InsightScreen = () => {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    // Fetch daily data from Firebase
    const fetchDailyData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
      const userRef = db.collection('users').doc(currentUser.uid);
      const querySnapshot = await userRef.collection('Dates').get();
      const data = querySnapshot.docs.map((doc) => doc.data());
      // console.log(data)
      setDailyData(data);
      }
    };

    fetchDailyData();
  }, []);

  useEffect(() => {
    // Calculate weekly and monthly progress
    const calculateProgress = () => {
      const weeklyProgress = {};
      const monthlyProgress = {};
    
      dailyData.forEach((item) => {
        const [year, month, day] = item.date.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const week = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`;
        // console.log("Date:" + date) 
        // console.log("Week:" + week)
        // Calculate weekly progress
        if (weeklyProgress[week]) {
          weeklyProgress[week] += item.time/60;
        } else {
          weeklyProgress[week] = item.time/60;
        }
    
        // Calculate monthly progress
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        // console.log(monthKey)
        if (monthlyProgress[monthKey]) {
          monthlyProgress[monthKey] += item.time/60;
        } else {
          monthlyProgress[monthKey] = item.time/60;
        }
      });
    
      // Convert progress objects to arrays for charting
      const weeklyChartData = Object.entries(weeklyProgress).map(([week, time]) => ({
        week,
        time,
      }));
    
      const monthlyChartData = Object.entries(monthlyProgress).map(([month, time]) => ({
        month,
        time,
      }));
    
      setWeeklyData(weeklyChartData);
      setMonthlyData(monthlyChartData);
    };    

    calculateProgress();
  }, [dailyData]);

  const barChartWidthWeek = Math.max(Dimensions.get('window').width - 16, weeklyData.length * 100);
  const barChartWidthMonth = Math.max(Dimensions.get('window').width - 16, monthlyData.length * 100);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Activity</Text>
      <View>
        <Text style={styles.header}>Weekly Progress</Text>
        <ScrollView horizontal style={styles.graph}>
        <BarChart
          data={{
            labels: weeklyData.map((data) => data.week),
            datasets: [{ data: weeklyData.map((data) => data.time) }],
          }}
          width={barChartWidthWeek}
          height={220}
          fromZero={true}
          showBarTops={false}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            fillShadowGradientFrom: 'purple',
            fillShadowGradientTo: 'purple',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 5,
            },
          }}
        />
        </ScrollView>
      </View>
      <View>
        <Text style={styles.header}>Monthly Progress</Text>
        <ScrollView horizontal style={styles.graph}>
        <BarChart
          data={{
            labels: monthlyData.map((data) => data.month),
            datasets: [{ data: monthlyData.map((data) => data.time) }],
          }}
          width={barChartWidthMonth}
          height={220}
          fromZero={true}
          showBarTops={false}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            fillShadowGradientFrom: 'purple',
            fillShadowGradientTo: 'purple',
            decimalPlaces: 0,
            color: (opacity = 2) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 5,
            },
          }}
        />
        </ScrollView>
      </View>
    </View>
  );
};

export default InsightScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white'
  },

  title: {
    paddingLeft: 25,
    alignSelf:"flex-start",
    color: 'black',
    fontWeight: '600',
    fontSize: 27,
    marginTop: 10,
    marginBottom: 10,
  },

  header: {
    paddingLeft: 25,
    alignSelf:"flex-start",
    color: '#800080',
    fontWeight: '500',
    fontSize: 17,
    marginTop: 10,
    marginBottom: 10,
  },

  graph: {
    marginBottom: 5,
    marginLeft: -10,
  }
})