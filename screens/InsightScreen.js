import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { auth, db } from '../firebase';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from "moment";

const InsightScreen = () => {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [dateRange, setDateRange] = useState("Sun 2023-01-01 ~ Sat 2023-01-07")


  const months = ['', 'Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

useEffect(() => {
  // Subscribe to daily data changes from Firebase
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userRef = db.collection('users').doc(currentUser.uid).collection('Dates');

    // Set up a snapshot listener to get real-time updates
    const unsubscribe = userRef.onSnapshot((snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setDailyData(data);
    });

    // Unsubscribe when the component unmounts to avoid memory leaks
    return () => unsubscribe();
  }
}, []);
  
  useEffect(() => {
    // Calculate weekly and monthly progress
    const calculateProgress = () => {
      const weeklyProgress = {};
      const monthlyProgress = {};

      dailyData.forEach((item) => {
        const [year, month, day] = item.date.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        const weekdate = new moment(item.date, 'YYYY-M-D');
        const week = weekdate.week();
        const weekyear = weekdate.year();

        const weekKey = `${weekyear}-${week}`;

        if (!weeklyProgress[weekKey]) {
          weeklyProgress[weekKey] = [];
        }

        weeklyProgress[weekKey].push({
          day: weekdate.format('d'),
          time: item.time,
        });

        // Calculate monthly progress
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (monthlyProgress[monthKey]) {
          monthlyProgress[monthKey] += item.time / 60;
        } else {
          monthlyProgress[monthKey] = item.time / 60;
        }
      });

      // Convert progress objects to arrays for charting
      const weeklyChartData = Object.entries(weeklyProgress).map(([weekKey, data]) => ({
        week: weekKey,
        data,
      }))


      const monthlyChartData = Object.entries(monthlyProgress).map(([month, time]) => ({
        month,
        time,
      }));

      setWeeklyData(weeklyChartData);
      setMonthlyData(monthlyChartData);
    };

    calculateProgress();
  }, [dailyData]);

  useEffect(() => {
    calculateWeekRange(selectedWeek, selectedYear)
  })
  const getDateLabels = (month) => {
    const mom = new moment();
    mom.set('month', month - 1); 
    const daysInMonth = mom.daysInMonth();
    return Array.from({length: daysInMonth}, (_, i) => i + 1);
  };

  const getDates = (month) => {
    const mom = new moment();
    mom.set('month', month - 1); 
    const daysInMonth = mom.daysInMonth();
    return daysInMonth
  };

  const getMaxWeeks = (year) => {
    const weeksInYear = moment(year, 'YYYY').isoWeeksInYear();
    return weeksInYear;
  }

  const getMonthlyTimeData = () => {
    const selectedDays = dailyData.filter((item) => {
      const [year, month, day] = item.date.split('-');
      return year === selectedYear && month === selectedMonth;
    });

    const daysTimeData = Array.from({ length: getDates(selectedMonth) }, () => 0); // Create an array of length 4 filled with zeros
  
    selectedDays.forEach((item) => {
      const [year, month, day] = item.date.split('-');
      daysTimeData[day - 1] = item.time / 60;
    });
  
    return daysTimeData;
  };  

  const getWeeklyTimeData = () => {
    const selectedWeeks = weeklyData.filter((item) => {
      const [year, week] = item.week.split('-');
      return year === selectedYear && week === selectedWeek
    });
    
    const weekTimeData = Array.from({ length: 7 }, () => 0); // Create an array of length 4 filled with zeros
  
    selectedWeeks.forEach((item) => {
      item.data.map((item) => {
        const day = item.day;
        const time = item.time;
        weekTimeData[day] = time;
      })
    });

    return weekTimeData;
  };  

  const getYearlyTimeData = () => {
    const selectedYears = monthlyData.filter((item) => {
      const [year, month] = item.month.split('-');
      return year === selectedYear;
    });
    const monthTimeData = Array.from({ length: 12 }, () => 0); // Create an array of length 4 filled with zeros
    selectedYears.forEach((item) => {
      const [year, month] = item.month.split('-');
      monthTimeData[month] = item.time;
    });
  
    return monthTimeData;
  };  

  const calculateWeekRange = (week, year) => {
    // Get the start date of the week
    const startDate = moment().year(year).week(week).startOf('week').format('YYYY-MM-DD');
    // Get the end date of the week
    const endDate = moment().year(year).week(week).endOf('week').format('YYYY-MM-DD');
    setDateRange("Sun " + startDate + " ~ Sat " + endDate);
  }

  const barChartWidthDaily = Math.max(Dimensions.get('window').width - 16, dailyData.length * 100);
  const barChartWidthMonth = Math.max(Dimensions.get('window').width - 16, monthlyData.length * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Activity</Text>
      <ScrollableTabView initialPage={0} renderTabBar={() => <DefaultTabBar />}>
        <View tabLabel="Weekly">
        <Text style={styles.header}>Select Your Month & Year:</Text>
          <View style={styles.box}>
          

          <View style={styles.selection}>
            <Text style={styles.selectText}>Select a Year: </Text>
            <TouchableOpacity onPress={() => {
              setSelectedYear((prevYear) => String(Number(prevYear) - 1))
              setSelectedWeek((prevWeek) => '1')
            }}>
              <Icon
                name='menu-left-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
            <Text style={styles.text}>{selectedYear}</Text>
            <TouchableOpacity onPress={() => {
              if (selectedYear > 0) {
                setSelectedYear((prevYear) => String(Number(prevYear) + 1))
                setSelectedWeek((prevWeek) => '1')
              }
              
            }}>
              <Icon
                name='menu-right-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.selection}>
            <Text style={styles.selectText}>Select a Week: </Text>
            <TouchableOpacity onPress={() => {
              if (selectedWeek > 1) {
                setSelectedWeek((prevWeek) => String(Number(prevWeek) - 1))
              }
              }} style={styles.button}>
              <Icon
                name='menu-left-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
            <Text style={styles.text}>Week {selectedWeek}</Text>
            <TouchableOpacity onPress={() => {
              if (selectedWeek < getMaxWeeks(selectedYear)){
                setSelectedWeek((prevWeek) => String(Number(prevWeek) + 1))
              } else {
                setSelectedWeek((prevWeek) => '1')
              }
              }} style={styles.button}>
              <Icon
                name='menu-right-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
          </View>
          </View>

          <View>
            <Text style={styles.header}>Week {selectedWeek} of {selectedYear} Progress</Text>
            <ScrollView horizontal style={styles.graph}>
              <BarChart
                data={{
                  labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                  datasets: [{ data: getWeeklyTimeData() }],
                }}
                width={400}
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
          <Text style={styles.dateRangeText}>{dateRange}</Text>
          </View>
        </View>
        <View tabLabel="Monthly">
        <Text style={styles.header}>Select Your Month & Year:</Text>
          <View style={styles.box}>
          <View style={styles.selection}>
            <Text style={styles.selectText}>Select a Month: </Text>
            <TouchableOpacity onPress={() => {
              if (selectedMonth > 1) {
                setSelectedMonth((prevMonth) => String(Number(prevMonth) - 1))
              } else {
                setSelectedMonth((prevMonth) => '12')
                setSelectedYear((prevYear) => String(Number(prevYear) - 1))
              }
              }} style={styles.button}>
              <Icon
                name='menu-left-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
            <Text style={styles.text}>{months[selectedMonth]}</Text>
            <TouchableOpacity onPress={() => {
              if (selectedMonth < 12){
                setSelectedMonth((prevMonth) => String(Number(prevMonth) + 1))
              } else {
                setSelectedMonth((prevMonth) => '1')
                setSelectedYear((prevYear) => String(Number(prevYear) + 1))
              }
              }} style={styles.button}>
              <Icon
                name='menu-right-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.selection}>
            <Text style={styles.selectText}>Select a Year: </Text>
            <TouchableOpacity onPress={() => {
              setSelectedYear((prevYear) => String(Number(prevYear) - 1))
            }}>
              <Icon
                name='menu-left-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
            <Text style={styles.text}>{selectedYear}</Text>
            <TouchableOpacity onPress={() => {
              if (selectedYear > 0) {
                setSelectedYear((prevYear) => String(Number(prevYear) + 1))
              }
            }}>
              <Icon
                name='menu-right-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
          </View>
          </View>

          <View>
            <Text style={styles.header}>{months[selectedMonth]} {selectedYear} Monthly Progress</Text>
            <ScrollView horizontal style={styles.graph}>
              <BarChart
                data={{
                  labels: getDateLabels(selectedMonth),
                  datasets: [{ data: getMonthlyTimeData() }],
                }}
                width={barChartWidthMonth * 5}
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
        </View>

        <View tabLabel="Yearly">
        <Text style={styles.header}>Select Your Year:</Text>
          <View style={styles.box}>
            <View style={styles.selection}>
            <Text style={styles.selectText}>Select a Year: </Text>
            <TouchableOpacity onPress={() => {
              setSelectedYear((prevYear) => String(Number(prevYear) - 1))
            }}>
              <Icon
                name='menu-left-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
            <Text style={styles.text}>{selectedYear}</Text>
            <TouchableOpacity onPress={() => {
              if (selectedYear > 0) {
                setSelectedYear((prevYear) => String(Number(prevYear) + 1))
              }
            }}>
              <Icon
                name='menu-right-outline'
                color={'purple'}
                size={30}
              />
            </TouchableOpacity>
          </View>
          </View>

          <View>
            <Text style={styles.header}>{selectedYear} Progress</Text>
            <ScrollView horizontal style={styles.graph}>
              <BarChart
                data={{
                  labels: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  datasets: [{ data: getYearlyTimeData() }],
                }}
                width={1200}
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
        </View>

        <View tabLabel="All Data">
          <View>
            <Text style={styles.header}>Daily Total</Text>
            <ScrollView horizontal style={styles.graph}>
              <BarChart
                data={{
                  labels: dailyData.map((data) => data.date),
                  datasets: [{ data: dailyData.map((data) => data.time / 60) }],
                }}
                width={barChartWidthDaily}
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
            <Text style={styles.header}>Monthly Total</Text>
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
      </ScrollableTabView>
    </View>
  );
};

export default InsightScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  title: {
    paddingLeft: 25,
    alignSelf: 'flex-start',
    color: 'black',
    fontWeight: '600',
    fontSize: 27,
    marginTop: 10,
    marginBottom: 10,
  },

  header: {
    paddingLeft: 25,
    alignSelf: 'flex-start',
    color: '#800080',
    fontWeight: '500',
    fontSize: 17,
    marginTop: 10,
    marginBottom: 5,
  },

  text: {
    color: '#800080',
    fontWeight: '500',
    fontSize: 17,
  },

  graph: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: -15,
  },

  selection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  weekbutton: {
    borderColor: 'purple',
  },

  selectText: {
    paddingLeft: 10,
    alignSelf:"flex-start",
    color: '#800080',
    fontWeight: '300',
    fontSize: 15,
    marginVertical: 10,
  },

  box: {
    padding: 15,
    backgroundColor: "#EFDCF9",
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    width: '90%',
    marginTop: 10,
    marginBottom: 5,
  }, 

  dateRangeText: {
    alignSelf:"center",
    color: '#800080',
    fontWeight: '300',
    fontSize: 15,
    marginVertical: 10,
  }
});