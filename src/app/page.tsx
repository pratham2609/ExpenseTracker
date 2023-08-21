'use client'
import React, { useState, useEffect } from 'react'
type Item = {
  name: string;
  id: string;
  price: string;
}
import { collection, setDoc, doc, onSnapshot, deleteDoc, addDoc } from "firebase/firestore";
import { db } from '../../firebase/clientAp';
export default function Home() {
  const [demoItems, setDemoItems] = useState<Item[]>([]);
  const [items, setItems] = useState(
    { name: '', price: '' },
  );
  const [total, setTotal] = useState(0)
  //Tasks====
  // Add item to databse
  const addItem = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (items.name !== '' && items.price !== null) {
      try {
        // set doc and doc for updating or creating a new element with id but add doc and collection for storing new data
        await addDoc(collection(db, 'expenses'), {
          name: items.name.trim(),
          price: items.price
        });
        setItems({ name: '', price: '' });
      } catch (error) {
        console.log("Error adding document: ", error);
      }
    }
  };



  // Read items from database
  useEffect(() => {
    const collectionRef = collection(db, "expenses");
    const unsub = onSnapshot(collectionRef, (querySnapshot) => {
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setDemoItems(data)
      console.log("Current data: ", data);
    }, (error) => {
      console.error("Error getting documents:", error);
    });
    // calculating total from array
    const calculate = () => {
      let total = 0;
      demoItems.forEach(item => {
        total += Number(item.price)
      });
      setTotal(total)
    }
    calculate();
    return () => unsub(); // Clean up the listener when the component unmounts
  }, []);



  // Delete from database
  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      console.log("Error deleting document: ", error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full items-center font-mono text-sm flex-col gap-5">
        <h1 className='text-4xl font-bold'>Expense Tracker</h1>
        <div className='bg-slate-800 p-4 mt-6 rounded-lg '>
          <form onSubmit={addItem} className='grid grid-cols-6 gap-3 items-center text-black'>
            <input
              onChange={(e) => {
                setItems({ ...items, name: e.target.value });
              }} name='itemName' className='col-span-3 p-2 border' type='text' placeholder='Enter Item' />
            <input onChange={(e) => {
              setItems({ ...items, price: e.target.value });
            }} name='itemPrice' className='col-span-2 p-2 border' type='number' placeholder='Enter $' />
            <button type='submit' className='text-white bg-slate-950 hover:bg-slate-900 h-full text-xl'>+</button>
          </form>
          <ul className=''>
            {demoItems.map((item, index) => (
              <li key={index} className='my-4 w-full flex justify-between bg-slate-950 rounded-md items-center'>
                <div className='p-4 w-full justify-between flex items-center'>
                  <span className='capitalize'>{item.name}</span>
                  <span>₹{item.price}</span>
                </div>
                <button onClick={() => deleteItem(item.id)} className='ml-8 p-4 border-l-2 transition-color duration-300 border-slate-900 hover:bg-slate-900 w-16'>X</button>
              </li>
            ))}
          </ul>
          {
            demoItems.length > 0 && <div className='flex justify-between w-full items-center p-3'>
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          }
        </div>
      </div>
    </main >
  )
}
