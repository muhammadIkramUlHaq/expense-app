import React, { useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Player {
  name: string;
}
interface Expense {
  payer: string;
  amount: number;
  activity: string;
  splitBetween: string[];
}

export default function ExpensesScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState("");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [activity, setActivity] = useState("");
  const [splitSelection, setSplitSelection] = useState<{
    [key: string]: boolean;
  }>({});
  const [summary, setSummary] = useState<{ [key: string]: number } | null>(
    null
  );

  const addPlayer = () => {
    const trimmed = newPlayer.trim();
    if (!trimmed) return;

    if (players.find((p) => p.name === trimmed)) {
      Alert.alert("Player already exists!");
      return;
    }

    setPlayers((prev) => [...prev, { name: trimmed }]);
    setSplitSelection((prev) => ({ ...prev, [trimmed]: true }));
    setNewPlayer("");
  };

  const toggleCheckbox = (name: string) => {
    setSplitSelection((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const addExpense = () => {
    const selectedPlayers = Object.entries(splitSelection)
      .filter(([_, val]) => val)
      .map(([name]) => name);

    if (!payer || !amount || selectedPlayers.length === 0) {
      Alert.alert("Please fill all fields and select players.");
      return;
    }

    const newExpense: Expense = {
      payer,
      amount: parseFloat(amount),
      activity,
      splitBetween: selectedPlayers,
    };

    setExpenses((prev) => [...prev, newExpense]);
    setPayer("");
    setAmount("");
    setActivity("");
    setSplitSelection((prev) => {
      const reset: { [key: string]: boolean } = {};
      Object.keys(prev).forEach((key) => (reset[key] = true));
      return reset;
    });
    setSummary(null);
  };

  const calculateResult = () => {
    const balances: { [key: string]: number } = {};
    players.forEach((p) => (balances[p.name] = 0));

    expenses.forEach((exp) => {
      const share = exp.amount / exp.splitBetween.length;
      exp.splitBetween.forEach((person) => {
        balances[person] -= share;
      });
      balances[exp.payer] += exp.amount;
    });

    setSummary(balances);
  };

  const showPayerSelector = () => {
    if (players.length === 0) return;

    Alert.alert("Select Payer", "", [
      ...players.map((p) => ({
        text: p.name,
        onPress: () => setPayer(p.name),
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Weekly Expense Tracker</Text>

        <Text style={styles.subtitle}>Add Players</Text>
        <View style={styles.row}>
          <TextInput
            placeholder="Player Name"
            value={newPlayer}
            onChangeText={setNewPlayer}
            style={styles.input}
          />
          <Button title="Add" onPress={addPlayer} />
        </View>

        <FlatList
          data={players}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <Text style={styles.item}>👤 {item.name}</Text>
          )}
        />

        {players.length > 0 && (
          <>
            <Text style={styles.subtitle}>Add Expense</Text>

            <Text style={styles.label}>Payer:</Text>
            <Pressable style={styles.dropdown} onPress={showPayerSelector}>
              <Text style={styles.dropdownText}>
                {payer ? payer : "Select player"}
              </Text>
            </Pressable>

            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Activity (e.g., Refreshment)"
              value={activity}
              onChangeText={setActivity}
              style={styles.input}
            />

            <Text style={styles.label}>Split Between:</Text>
            {players.map((p) => (
              <Pressable
                key={p.name}
                style={styles.checkboxRow}
                onPress={() => toggleCheckbox(p.name)}
              >
                <Text style={styles.checkboxBox}>
                  {splitSelection[p.name] ? "☑" : "⬜"}
                </Text>
                <Text>{p.name}</Text>
              </Pressable>
            ))}
          </>
        )}

        {expenses.length > 0 && (
          <>
            <Text style={styles.subtitle}>Expenses</Text>
            {expenses.map((e, i) => (
              <Text key={i} style={styles.item}>
                {e.payer} paid {e.amount} SEK for &quot;{e.activity}&quot; split
                among {e.splitBetween.length} players
              </Text>
            ))}

            <Button
              title="Calculate Split"
              onPress={calculateResult}
              color="#007b00"
            />
          </>
        )}

        {summary && (
          <>
            <Text style={styles.subtitle}>Final Summary</Text>
            {Object.entries(summary).map(([name, value]) => (
              <Text key={name} style={styles.item}>
                {name} {value < 0 ? "owes" : "gets"}{" "}
                {Math.abs(value).toFixed(2)} SEK
              </Text>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.stickyButton}>
        <Button title="Add Expense" onPress={addExpense} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 180, // extra space to allow scrolling past the sticky button
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  label: {
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#555",
  },
  item: { fontSize: 16, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  },
  checkboxBox: {
    fontSize: 20,
    width: 28,
  },
  stickyButton: {
    position: "absolute",
    bottom: 80, // higher so it's not hidden by tab bar
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
});
