import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { auth, db } from '../firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from "moment";

const InsightScreen = () => {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [startdate, setStartDate] = useState('')
  const [dateRange, setDateRange] = useState("Sun 2023-01-01 ~ Sat 2023-01-07")
  const [activeTab, setActiveTab] = useState('Weekly');
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

  useEffect(() => {
    const start = moment().year(selectedYear).week(selectedWeek).startOf('week').format('DD-MM');
    setStartDate(start);
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
        weekTimeData[day] = time / 60;
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
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Weekly' && styles.activeTabButton]}
          onPress={() => setActiveTab('Weekly')}
        >
          <Text style={styles.tabButtonText}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Monthly' && styles.activeTabButton]}
          onPress={() => setActiveTab('Monthly')}
        >
          <Text style={styles.tabButtonText}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Yearly' && styles.activeTabButton]}
          onPress={() => setActiveTab('Yearly')}
        >
          <Text style={styles.tabButtonText}>Yearly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'AllData' && styles.activeTabButton]}
          onPress={() => setActiveTab('AllData')}
        >
          <Text style={styles.tabButtonText}>All Data</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Weekly' && (
        <View>
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
            <Text style={styles.text}>{startdate}</Text>
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
            <Text style={styles.graphheader}>Week {selectedWeek} of {selectedYear} Progress</Text>
            <View style={styles.graphbox}>
            <ScrollView horizontal style={styles.graph}>
              <BarChart
                data={{
                  labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                  datasets: [{ data: getWeeklyTimeData() }],
                }}
                width={400}
                height={300}
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
        </View>
      )}

      {activeTab === 'Monthly' && (
        <View>
          <Text style={styles.header}>Select Your Month & Year:</Text>
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
          </View>

          <View>
            <Text style={styles.graphheader}>{months[selectedMonth]} {selectedYear} Monthly Progress</Text>
            <View style={styles.graphbox}>
            <ScrollView horizontal style={styles.graph}>
              <BarChart
                data={{
                  labels: getDateLabels(selectedMonth),
                  datasets: [{ data: getMonthlyTimeData() }],
                }}
                width={barChartWidthMonth * 5}
                height={300}
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
        </View>
      )}

      {activeTab === 'Yearly' && (
        <View>
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
            <Text style={styles.graphheader}>{selectedYear} Progress</Text>
            <View style={styles.graphbox}>
            <ScrollView horizontal style={styles.graph}>
              <BarChart
                data={{
                  labels: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  datasets: [{ data: getYearlyTimeData() }],
                }}
                width={1200}
                height={300}
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
        </View>
      )}


    {activeTab === 'AllData' && (
        <View>
           <View>
            <Text style={styles.graphheader}>Daily Total</Text>
            <View style={styles.graphbox}>
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
          </View>

          <View>
            <Text style={styles.graphheader}>Monthly Total</Text>
            <View style={styles.graphbox}>
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
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 5,
                  },
                }}
              />
            </ScrollView>
          </View>
        </View>
        </View>
      )}
    </View>
  );}

export default InsightScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 15,
    textAlign: 'center',
  },

  header: {
    paddingLeft: 20,
    alignSelf: 'flex-start',
    color: '#800080',
    fontWeight: '500',
    fontSize: 17,
    marginTop: 15,
    marginBottom: 5,
  },

  text: {
    color: '#800080',
    fontWeight: '500',
    fontSize: 17,
  },

  graphheader: {
    color: '#800080',
    fontWeight: '500',
    fontSize: 17,
    textAlign: 'center',
    marginTop: 15,
  },

  graph: {
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 10,
  },

  graphbox: {
    justifyContent: 'flex-start',
    alignSelf: 'center',
    alignItems: 'center',
    width: '90%',
    marginBottom: 5,
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
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 5,
    marginBottom: 5,
    marginHorizontal: 10,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#800080',
    marginHorizontal: 5,
  },

  tabButtonText: {
    color: '#800080',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },

  activeTabButton: {
    backgroundColor: '#80008033',
  },
});