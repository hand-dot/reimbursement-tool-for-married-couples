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
  handleChange:
    | ((
        event: React.ChangeEvent<HTMLInputElement>,
        field: keyof ExpenseDetail
      ) => void)
    | null
) => (
  <div className="bg-gray-100 p-4">
    <h3 className="text-lg font-bold mb-2">
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </h3>
    {Object.keys(expenses).map((key) => (
      <div key={key} className="flex items-center mb-2">
        <label
          htmlFor={`${role}-${key}`}
          className="mr-2 font-medium text-gray-700"
        >
          {key}:
        </label>
        <input
          type="number"
          id={`${role}-${key}`}
          value={expenses[key as keyof typeof expenses]}
          disabled={!handleChange}
          onChange={(event) =>
            handleChange && handleChange(event, key as keyof typeof expenses)
          }
          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm disabled:opacity-90 disabled:cursor-not-allowed"
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

  const handleExpenseChange = (
    role: "husband" | "wife",
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof husbandExpenses
  ) => {
    const updateExpenses =
      role === "husband" ? setHusbandExpenses : setWifeExpenses;
    const currentExpenses = role === "husband" ? husbandExpenses : wifeExpenses;
    updateExpenses({ ...currentExpenses, [field]: Number(event.target.value) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">Enter expenses for {month}</h2>
      <div>
        {renderExpenses("husband", husbandExpenses, (event, field) =>
          handleExpenseChange("husband", event, field)
        )}
        {renderExpenses("wife", wifeExpenses, (event, field) =>
          handleExpenseChange("wife", event, field)
        )}
      </div>
      <button
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
        type="submit"
      >
        Submit Expenses
      </button>
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
    <div className="mt-10">
      <div className="flex justify-center items-center mb-4">
        <label
          htmlFor="month-select"
          className="mr-2 font-medium text-gray-700"
        >
          Select month to view past expenses:
        </label>

        <select
          id="month-select"
          value={selectedMonth}
          onChange={handleMonthSelect}
          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
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
        <div className="bg-gray-100 p-4">
          <h3 className="text-lg font-bold mb-2">
            Expenses for {selectedExpense.month}
          </h3>
          <div className="mt-4 flex justify-evenly items-center">
            {renderExpenses("husband", selectedExpense.husband, null)}
            {renderExpenses("wife", selectedExpense.wife, null)}
          </div>
        </div>
      )}
    </div>
  );
};

const Reimbursement: React.FC<{ selectedExpense: Expense | undefined }> = ({
  selectedExpense,
}) => {
  if (!selectedExpense) return null;

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

  const isPaidMoreHusband =
    getExpenseDetailSum(selectedExpense.husband) >
    getExpenseDetailSum(selectedExpense.wife);

  return (
    <div className="bg-gray-100 p-4">
      <h3 className="text-lg font-bold mb-2">Reimbursement:</h3>
      {reimbursement > 0 ? (
        <p className="text-gray-700">
          To balance expenses,{" "}
          <span className="font-medium">
            {isPaidMoreHusband ? "wife" : "husband"}
          </span>{" "}
          should give{" "}
          <span className="font-medium text-indigo-500">¥{reimbursement}</span>{" "}
          to {!isPaidMoreHusband ? "wife" : "husband"}.
        </p>
      ) : (
        <p className="text-gray-700">Expenses are already balanced.</p>
      )}
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

  const getMonthlyExpense = (expenses: Expense[], selectedMonth: string) =>
    expenses.find((expense) => expense.month === selectedMonth);

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
