'use client'

import { useState } from "react"

export default function BookEvent() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {

    }


   return (
    <div id="book-event"> 
        {submitted ? (
            <p>Thank you for singing up!</p>
        ) : (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                    placeholder="Enter your email address"
                    required
                    />
                </div>
                <button type="submit" >Submit</button>
            </form>
        )}
    </div>
   )
}