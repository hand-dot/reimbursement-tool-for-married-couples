import React, { useState, useEffect } from "react";

interface ExpenseDetail {
  food: number;
  communication: number;
  water: number;
  gasElectric: number;
  rent: number;
  education: number;
}
type Expense = {
  month: string;
  husband: ExpenseDetail;
  wife: ExpenseDetail;
};

type ExpenseFormProps = {
  onSubmit: (expense: Expense) => void;
  month: string;
};

const getInitialExpenseDetail = (): ExpenseDetail => ({
  food: 0,
  communication: 0,
  water: 0,
  gasElectric: 0,
  rent: 0,
  education: 0,
});

const getCurrentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}`;
};

const getExpenseDetailSum = (expenseDetail: ExpenseDetail) =>
  Object.values(expenseDetail).reduce((a, b) => a + b, 0);

const renderExpenses = (
  role: "husband" | "wife",
  expenses: ExpenseDetail,
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof ExpenseDetail
  ) => void
) => (
  <div>
    <h3>{role.charAt(0).toUpperCase() + role.slice(1)}</h3>
    {Object.keys(expenses).map((key) => (
      <div key={key}>
        <label htmlFor={`${role}-${key}`}>{key}: </label>
        <input
          type="number"
          id={`${role}-${key}`}
          value={expenses[key as keyof typeof expenses]}
          onChange={(event) =>
            handleChange(event, key as keyof typeof expenses)
          }
        />
      </div>
    ))}
  </div>
);

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, month }) => {
  const [husbandExpenses, setHusbandExpenses] = useState(
    getInitialExpenseDetail()
  );

  const [wifeExpenses, setWifeExpenses] = useState(getInitialExpenseDetail());

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
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Enter expenses for {month}
      </h2>
      <div>
        {renderExpenses("husband", husbandExpenses, handleHusbandExpenseChange)}
        {renderExpenses("wife", wifeExpenses, handleWifeExpenseChange)}
      </div>
      <button type="submit">Submit Expenses</button>
    </form>
  );
};

const PastExpenses: React.FC<{
  expenses: Expense[];
  selectedMonth: string;
  handleMonthSelect: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedExpense: Expense | undefined;
}> = ({ expenses, selectedMonth, handleMonthSelect, selectedExpense }) => {
  return (
    <>
      <div>
        <label htmlFor="month-select">
          Select month to view past expenses:{" "}
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
          {[
            ["Husband", selectedExpense.husband],
            ["Wife", selectedExpense.wife],
          ].map(([title, expense]) => (
            <div>
              <h4>{title as string}</h4>
              <ul>
                {Object.entries(expense).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const Reimbursement: React.FC<{ selectedExpense: Expense | undefined }> = ({
  selectedExpense,
}) => {
  const calculateReimbursement = (
    husbandExpenses: number,
    wifeExpenses: number
  ) => {
    return Math.abs(husbandExpenses - wifeExpenses);
  };

  const reimbursement = selectedExpense
    ? calculateReimbursement(
        getExpenseDetailSum(selectedExpense.husband),
        getExpenseDetailSum(selectedExpense.wife)
      )
    : 0;
  return (
    <div>
      <h3>Reimbursement:</h3>
      {selectedExpense && reimbursement > 0
        ? `To balance expenses, ${
            getExpenseDetailSum(selectedExpense.husband) >
            getExpenseDetailSum(selectedExpense.wife)
              ? "husband"
              : "wife"
          } should give ¥${reimbursement} to the other.`
        : "Expenses are already balanced."}
    </div>
  );
};

const ExpenseCalculator = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [selectedMonth, setSelectedMonth] = useState(month);

  useEffect(() => {
    // Load expenses from local storage or fetch from firestore in the future
    const loadedExpenses = localStorage.getItem("expenses");
    if (loadedExpenses) {
      setExpenses(JSON.parse(loadedExpenses));
    }
    // Set current month
    setMonth(getCurrentMonth());
  }, []);

  useEffect(() => {
    // Save expenses to local storage
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (newExpense: Expense) => {
    setExpenses([...expenses, newExpense]);
  };

  const getMonthlyExpense = (expenses: Expense[], selectedMonth: string) => {
    return expenses.find((expense) => expense.month === selectedMonth);
  };

  const handleMonthSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const selectedExpense = getMonthlyExpense(expenses, selectedMonth);

  // Render form and display components here
  return (
    <div className="bg-white py-24 px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        {/* Render form to input expenses for husband and wife */}
        <ExpenseForm onSubmit={addExpense} month={month} />
        {/* Render list of months to select and view past expenses */}
        <PastExpenses
          expenses={expenses}
          selectedMonth={selectedMonth}
          handleMonthSelect={handleMonthSelect}
          selectedExpense={selectedExpense}
        />
        {/* Display reimbursement calculation result */}
        <Reimbursement selectedExpense={selectedExpense} />
      </div>
    </div>
  );
};

export default ExpenseCalculator;
