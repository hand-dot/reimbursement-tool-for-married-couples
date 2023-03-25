import React, { useState, useEffect } from 'react';

type ExpenseFormProps = {
  onSubmit: (expense: Expense) => void;
  month: string;
};

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, month }) => {
  const [husbandExpenses, setHusbandExpenses] = useState({
    food: 0,
    communication: 0,
    water: 0,
    gasElectric: 0,
    rent: 0,
    education: 0,
  });

  const [wifeExpenses, setWifeExpenses] = useState({
    food: 0,
    communication: 0,
    water: 0,
    gasElectric: 0,
    rent: 0,
    education: 0,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ month, husband: husbandExpenses, wife: wifeExpenses });
  };

  const handleHusbandExpenseChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof husbandExpenses
  ) => {
    setHusbandExpenses({
      ...husbandExpenses,
      [field]: Number(event.target.value),
    });
  };

  const handleWifeExpenseChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof wifeExpenses
  ) => {
    setWifeExpenses({ ...wifeExpenses, [field]: Number(event.target.value) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter expenses for {month}</h2>
      <div>
        <h3>Husband</h3>
        {Object.keys(husbandExpenses).map((key) => (
          <div key={key}>
            <label htmlFor={`husband-${key}`}>{key}: </label>
            <input
              type="number"
              id={`husband-${key}`}
              value={husbandExpenses[key as keyof typeof husbandExpenses]}
              onChange={(event) =>
                handleHusbandExpenseChange(
                  event,
                  key as keyof typeof husbandExpenses
                )
              }
            />
          </div>
        ))}
      </div>
      <div>
        <h3>Wife</h3>
        {Object.keys(wifeExpenses).map((key) => (
          <div key={key}>
            <label htmlFor={`wife-${key}`}>{key}: </label>
            <input
              type="number"
              id={`wife-${key}`}
              value={wifeExpenses[key as keyof typeof wifeExpenses]}
              onChange={(event) =>
                handleWifeExpenseChange(event, key as keyof typeof wifeExpenses)
              }
            />
          </div>
        ))}
      </div>
      <button type="submit">Submit Expenses</button>
    </form>
  );
};

type Expense = {
  month: string;
  husband: {
    food: number;
    communication: number;
    water: number;
    gasElectric: number;
    rent: number;
    education: number;
  };
  wife: {
    food: number;
    communication: number;
    water: number;
    gasElectric: number;
    rent: number;
    education: number;
  };
};

const date = new Date();

const ExpenseCalculator = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [month, setMonth] = useState(
    `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`
  );

  useEffect(() => {
    // Load expenses from local storage or fetch from firestore in the future
    const loadedExpenses = localStorage.getItem('expenses');
    if (loadedExpenses) {
      setExpenses(JSON.parse(loadedExpenses));
    }
    // Set current month
    const date = new Date();
    const currentMonth = `${date.getFullYear()}-${(
      '0' +
      (date.getMonth() + 1)
    ).slice(-2)}`;
    setMonth(currentMonth);
  }, []);

  useEffect(() => {
    // Save expenses to local storage
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (newExpense: Expense) => {
    setExpenses([...expenses, newExpense]);
  };

  const calculateReimbursement = (
    husbandExpenses: number,
    wifeExpenses: number
  ) => {
    return Math.abs(husbandExpenses - wifeExpenses);
  };

  const getMonthlyExpense = (expenses: Expense[], selectedMonth: string) => {
    return expenses.find((expense) => expense.month === selectedMonth);
  };

  const [selectedMonth, setSelectedMonth] = useState(month);

  const handleMonthSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const selectedExpense = getMonthlyExpense(expenses, selectedMonth);
  const reimbursement = selectedExpense
    ? calculateReimbursement(
        Object.values(selectedExpense.husband).reduce((a, b) => a + b, 0),
        Object.values(selectedExpense.wife).reduce((a, b) => a + b, 0)
      )
    : 0;

  console.log(reimbursement);

  // Render form and display components here
  return (
    <div>
      {/* Render form to input expenses for husband and wife */}
      <ExpenseForm onSubmit={addExpense} month={month} />
      {/* Render list of months to select and view past expenses */}
      <div>
        <label htmlFor="month-select">
          Select month to view past expenses:{' '}
        </label>

        <select
          id="month-select"
          value={selectedMonth}
          onChange={handleMonthSelect}
        >
          {expenses.map((expense, index) => (
            <option key={index} value={expense.month}>
              {expense.month}
            </option>
          ))}
        </select>
      </div>
      {/* Display past expenses */}
      {selectedExpense && (
        <div>
          <h3>Expenses for {selectedExpense.month}</h3>
          <h4>Husband</h4>
          <ul>
            {Object.entries(selectedExpense.husband).map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
          <h4>Wife</h4>
          <ul>
            {Object.entries(selectedExpense.wife).map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Display reimbursement calculation result */}
      <div>
        <h3>Reimbursement:</h3>
        {reimbursement > 0
          ? `To balance expenses, ${
              Object.values(
                selectedExpense ? selectedExpense.husband : {}
              ).reduce((a, b) => a + b, 0) >
              Object.values(selectedExpense ? selectedExpense.wife : {}).reduce(
                (a, b) => a + b,
                0
              )
                ? 'husband'
                : 'wife'
            } should give ¥${reimbursement} to the other.`
          : 'Expenses are already balanced.'}
      </div>
    </div>
  );
};

export default ExpenseCalculator;
