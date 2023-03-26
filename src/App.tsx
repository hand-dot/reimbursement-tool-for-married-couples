import React, { useState, useEffect } from "react";

interface ExpenseDetail {
  food: number;
  communication: number;
  water: number;
  gasElectric: number;
  rent: number;
  education: number;
}
interface Expense {
  month: string;
  husband: ExpenseDetail;
  wife: ExpenseDetail;
}

const t: { [key: string]: string } = {
  husband: "夫",
  wife: "妻",
  food: "食費",
  communication: "通信費",
  water: "水道費",
  gasElectric: "ガス電気",
  rent: "家賃",
  education: "教育費",
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

const getFormattedMonths = () => {
  const startYear = 2023;
  const startMonth = 1;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  let year = startYear;
  let month = startMonth;
  const formattedMonths: string[] = [];

  while (
    year < currentYear ||
    (year === currentYear && month <= currentMonth)
  ) {
    const formattedMonth = `${year}-${month.toString().padStart(2, "0")}`;
    formattedMonths.push(formattedMonth);

    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return formattedMonths;
};

const getExpenseDetailSum = (expenseDetail: ExpenseDetail) =>
  Object.values(expenseDetail).reduce((a, b) => a + b, 0);

const formatJapaneseYen = (amount: number): string => {
  const formatter = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  });
  return formatter.format(amount);
};

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
  <div className="w-full">
    <h3 className="text-lg font-bold mb-2">{t[role]}</h3>
    {Object.keys(expenses).map((key) => (
      <div key={key} className="mt-4">
        <label
          htmlFor={`${role}-${key}`}
          className="text-left block text-sm font-medium leading-6 text-gray-900"
        >
          {t[key]}:
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <input
            type="number"
            id={`${role}-${key}`}
            value={expenses[key as keyof typeof expenses]}
            disabled={!handleChange}
            onChange={(event) =>
              handleChange && handleChange(event, key as keyof typeof expenses)
            }
            className="block w-full rounded-md text-right border-0 py-1.5 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 sm:text-sm">円</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ExpenseForm: React.FC<{
  expenses: Expense[];
  onSubmit: (expense: Expense) => void;
  selectedMonth: string;
  handleMonthSelect: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ expenses, onSubmit, selectedMonth, handleMonthSelect }) => {
  const [husbandExpenses, setHusbandExpenses] = useState(
    getInitialExpenseDetail()
  );

  const [wifeExpenses, setWifeExpenses] = useState(getInitialExpenseDetail());

  useEffect(() => {
    const expense = expenses.find((e) => e.month === selectedMonth);
    if (expense) {
      setHusbandExpenses(expense.husband);
      setWifeExpenses(expense.wife);
    } else {
      setHusbandExpenses(getInitialExpenseDetail());
      setWifeExpenses(getInitialExpenseDetail());
    }
  }, [selectedMonth, expenses]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      month: selectedMonth,
      husband: husbandExpenses,
      wife: wifeExpenses,
    });
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
      <h2 className="text-xl font-bold">
        <select
          id="month-select"
          value={selectedMonth}
          onChange={handleMonthSelect}
          className="border-gray-300 mr-1 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
        >
          {getFormattedMonths().map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        の精算
      </h2>

      <Reimbursement
        expense={{
          month: selectedMonth,
          husband: husbandExpenses,
          wife: wifeExpenses,
        }}
      />
      <div className="flex justify-center items-center my-4">
        {renderExpenses("husband", husbandExpenses, (event, field) =>
          handleExpenseChange("husband", event, field)
        )}
        {renderExpenses("wife", wifeExpenses, (event, field) =>
          handleExpenseChange("wife", event, field)
        )}
      </div>
      <button
        className="mt-5 bg-blue-500 text-white font-bold py-2 px-4 rounded"
        type="submit"
      >
        費用を登録する
      </button>
    </form>
  );
};

const PastExpenses: React.FC<{
  expenses: Expense[];
  setSelectedMonth: (month: string) => void;
}> = ({ expenses, setSelectedMonth }) => {
  if (expenses.length === 0) return null;

  const sortedExpenses = expenses.sort((a, b) => {
    if (a.month < b.month) return 1;
    if (a.month > b.month) return -1;
    return 0;
  });

  return (
    <>
      <h2 className="text-xl font-bold">過去の精算</h2>
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full">
              <thead className="bg-white">
                <tr>
                  <th
                    scope="col"
                    className="w-20 text-center py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900 sm:pl-3"
                  ></th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                  >
                    {t.food}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    {t.communication}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    {t.water}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    {t.gasElectric}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    {t.rent}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    {t.education}
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedExpenses.map((expense) => (
                  <React.Fragment key={expense.month}>
                    <tr className="border-t border-gray-200">
                      <th
                        colSpan={7}
                        scope="colgroup"
                        className="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                      >
                        <div className="flex">
                          <div>
                            {expense.month}(合計:
                            {getExpenseDetailSum(expense.husband) +
                              getExpenseDetailSum(expense.wife)}
                            円)
                          </div>
                        </div>
                      </th>
                      <th
                        colSpan={1}
                        scope="colgroup"
                        className="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                      >
                        <div className="flex">
                          <a
                            href="#"
                            onClick={() => setSelectedMonth(expense.month)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            編集
                          </a>
                        </div>
                      </th>
                    </tr>
                    <tr className="border-gray-200 border-t">
                      <td className="w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                        {t.husband}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-3">
                        {formatJapaneseYen(expense.husband.food)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.husband.communication)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.husband.water)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.husband.gasElectric)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.husband.rent)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.husband.education)}円
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3"></td>
                    </tr>
                    <tr className="border-gray-200 border-t">
                      <td className="w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                        {t.wife}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-3">
                        {formatJapaneseYen(expense.wife.food)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.wife.communication)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.wife.water)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.wife.gasElectric)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.wife.rent)}円
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatJapaneseYen(expense.wife.education)}円
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3"></td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

const Reimbursement: React.FC<{ expense: Expense | undefined }> = ({
  expense,
}) => {
  if (!expense) return null;

  const calculateReimbursement = (
    husbandExpenses: number,
    wifeExpenses: number
  ) => {
    return Math.abs(husbandExpenses - wifeExpenses);
  };

  const reimbursement = expense
    ? calculateReimbursement(
        getExpenseDetailSum(expense.husband),
        getExpenseDetailSum(expense.wife)
      )
    : 0;

  const isPaidMoreHusband =
    getExpenseDetailSum(expense.husband) > getExpenseDetailSum(expense.wife);

  return (
    <div className="bg-gray-100 p-4 mt-4">
      <h3 className="text-lg font-bold mb-2">払い戻し:</h3>
      {reimbursement > 0 ? (
        <p className="text-gray-700">
          経費のバランスを取るため、{" "}
          <strong>
            {isPaidMoreHusband ? t.wife : t.husband}は
            {!isPaidMoreHusband ? t.wife : t.husband}
          </strong>{" "}
          に
          <span className="font-medium text-blue-500">
            {formatJapaneseYen(reimbursement)}円
          </span>{" "}
          を渡すこと。
        </p>
      ) : (
        <p className="text-gray-700">支出を調整する必要はありません</p>
      )}
    </div>
  );
};

const ExpenseCalculator = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    const loadedExpenses = localStorage.getItem("expenses");
    if (loadedExpenses) {
      setExpenses(JSON.parse(loadedExpenses));
    }
    setSelectedMonth(getCurrentMonth());
  }, []);

  useEffect(() => {
    if (!expenses.length) return;
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (newExpense: Expense) => {
    const target = expenses.find((e) => e.month === newExpense.month);
    const newExpenses = target
      ? expenses.map((e) => (e.month === newExpense.month ? newExpense : e))
      : [...expenses, newExpense];

    setExpenses(newExpenses);
  };

  const handleMonthSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div className="bg-white py-24 px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <ExpenseForm
          expenses={expenses}
          onSubmit={addExpense}
          selectedMonth={selectedMonth}
          handleMonthSelect={handleMonthSelect}
        />
        <hr className="my-10" />
        <PastExpenses expenses={expenses} setSelectedMonth={setSelectedMonth} />
      </div>
    </div>
  );
};

export default ExpenseCalculator;
