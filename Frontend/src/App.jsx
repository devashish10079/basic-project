import { useEffect, useState } from 'react';
import ProductList from './ProductList';
import './App.css';
import { API_BASE_URL } from './config';

function App() {


const [count,setCount]=useState(0);
const [num,setNum]=useState(10);
const [products,setProducts]=useState([]);



useEffect(()=>{
    async  function APIcall(){
      try {
        console.log("aman happy birthday..🎂");
        let responce= await fetch(`${API_BASE_URL}/api/products`);
        let data= await responce.json();
        console.log(data);
        setProducts(Array.isArray(data) ? data : data.products || []);  //pay attention , data formate change
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }


   APIcall();
},[]);

  // useEffect(()=>{ //execute each render
  //   console.log("parth");
  // });


  // useEffect(()=>{ //execute when count or num updated 
  //   console.log("sagar");
  // },[count,num]);

  //   useEffect(()=>{ //execute only one time 
  //   console.log("vikas");
  // },[]);

  return (
    <div className="app-wrapper">
      <div className="counter-panel">
        <div className="counter-card">
          <p className="counter-title">Count State</p>
          <div className="counter-value">{count}</div>
          <button className="counter-btn primary" onClick={()=>setCount(count+1)}>
            click count
          </button>
        </div>

        <div className="counter-card">
          <p className="counter-title">Num State</p>
          <div className="counter-value">{num}</div>
          <button className="counter-btn secondary" onClick={()=>setNum(num+1)}>
            click num
          </button>
        </div>
      </div>

      <ProductList products={products}/>
    </div>
  )
}

export default App