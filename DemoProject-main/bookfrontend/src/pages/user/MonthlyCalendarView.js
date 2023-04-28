import React, { useEffect, useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import { Calendar } from 'react-calendar';
import { TileContent } from 'react-calendar';
import ExpenseIncome from '../../components/ExpenseIncome'; 
import Header from '../../components/Header';

//Monthly calendar and savings goal
function MonthlyCalendarView(props) {

  const id=props.location.state;
const[user, setUser] = useState([]);
const[expenses, setExpense] = useState([]);
const[value, onChange] = useState(new Date());
//for the savings goal:
const [savingsGoal, setSavingsGoal] = useState(0);
const [showForm, setShowForm] = useState(false);
const [newSavingsGoal, setNewSavingsGoal]=useState(savingsGoal);
const [budget, setBudget]=useState(0);
const [balance, setBalance] = useState(0);
const [targetBalance, setTargetBalance] = useState(0);

function handleSavingsGoalChange(event){
  setNewSavingsGoal(event.target.value);
}

//for savings goal:
function handleSavingsGoalSubmit(event){
  event.preventDefault();
  setSavingsGoal(newSavingsGoal);
  setShowForm(false);
  //not sure how to do this but maybe an idea
  //can't complete this because I don't have the backend code.
   fetch('http://localhost:8080/setMonthlyBalance/' + id + '/' + newSavingsGoal);
}

function handleFormClose(){
  setShowForm(false);
  setNewSavingsGoal(savingsGoal);
}


function tileContent({date}){
    var summary = "\n";
    var expense_or_income = 2;
    expenses.forEach((expense) => {
      if(expense.due_date === date.toISOString().split('T')[0]){
        if(expense.information != undefined){
          if(expense.income_or_expense == 0){
            expense_or_income = 0;
            return summary += expense.information + ", ";
          }
          if(expense.income_or_expense == 1){
            expense_or_income = 1;
            return summary += expense.information + ", ";
          }
        }
      }
    })
    console.log(expense_or_income);
    if(expense_or_income == 0){
      return <div class='tile-expense'>{summary}</div>
    }
    if(expense_or_income == 1){
      return <div class='tile-income'>{summary}</div>
    }
}

//Target savings balance based on day of the month
function calcTargetBalance(){
  const daysInMonth = new Date(value.getFullYear(), value.getMonth()+1,0).getDate();
  const targetBalance = savingsGoal / daysInMonth * value.getDate();
  return targetBalance;
}

//calculate current savings balance
function calculateSavingsBalance(){
  let balance = user.total_balance;
  expenses.forEach((expense)=>{
    if(expense.income_or_expenses==1){
      balance += expense.amount;
    }
    else{
      balance -= expense.amount;
    }
  });
  return balance;
}


useEffect(()=>{
  fetch("http://localhost:8080/expense/" + id, {method:"GET"})
    .then(res => res.json())
    .then(res=> {
      setExpense(res);
      let totalExpense=0;
      res.forEach((expense) =>{
        if(expense.income_or_expense == 0){
          totalExpense+=expense.amount;
        }
      });
      setBudget(user.starting_budget-totalExpense);
    })
  fetch("http://localhost:8080/user/" + id, {method:"GET"})
  .then(res => res.json())
  .then(res=> {setUser(res); setSavingsGoal(res.savings_goal);
                const target = calcTargetBalance(); const current=calculateSavingsBalance();
                setTargetBalance(target); setBalance(current);})
},[])

  return (
    <div>
      <header class="loginheader">
        <div className="banklogo"/>
      </header>
      <div>
        <Header id={id}/>
      </div>
      <form onSubmit={handleSavingsGoalSubmit}>
        <div>
          <p>Monthly Savings Goal: ${savingsGoal}</p>
          <Button onClick={() => setShowForm(true)}>Change Goal</Button>
          <br></br>
        </div>
      </form>
        {showForm && (
          <Form onSubmit={handleSavingsGoalSubmit}>
            <Form.Group controlId="formSavingsGoal">
              <Form.Label>Enter Monthly Savings Goal: $</Form.Label>
              <Form.Control type="number" value={newSavingsGoal} onChange={handleSavingsGoalChange} />
            </Form.Group>
            <Button variant="primary" type="submit">Save</Button>
            <Button variant="secondary" onClick={handleFormClose}>Cancel</Button>
          </Form>
        )}
      <Calendar onChange={onChange} value={value} tileContent={tileContent} tileClassName={'calendar-tile'}/>
    </div>
  );
}



export default MonthlyCalendarView;
