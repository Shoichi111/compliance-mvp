"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function FirebaseTest() {
  const [status, setStatus] = useState("Testing Firebase connection...");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testFirebase = async () => {
      try {
        addLog("✅ Firebase config loaded");
        
        // Test creating a user
        const testEmail = "test@example.com";
        const testPassword = "test123";
        
        try {
          addLog("🔄 Creating test user...");
          const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
          addLog(`✅ Test user created: ${userCredential.user.email}`);
          
          // Test Firestore
          addLog("🔄 Testing Firestore...");
          await setDoc(doc(db, "users", userCredential.user.uid), {
            email: testEmail,
            role: "test",
            createdAt: new Date()
          });
          addLog("✅ Firestore write successful");
          
          // Test login
          addLog("🔄 Testing login...");
          await signInWithEmailAndPassword(auth, testEmail, testPassword);
          addLog("✅ Login successful");
          
          setStatus("✅ All Firebase services working!");
          
        } catch (error: any) {
          if (error.code === "auth/email-already-in-use") {
            addLog("ℹ️ Test user already exists, trying login...");
            try {
              await signInWithEmailAndPassword(auth, testEmail, testPassword);
              addLog("✅ Login with existing test user successful");
              setStatus("✅ Firebase Auth working!");
            } catch (loginError: any) {
              addLog(`❌ Login failed: ${loginError.message}`);
              setStatus("❌ Firebase Auth not working");
            }
          } else {
            addLog(`❌ Firebase error: ${error.message}`);
            setStatus("❌ Firebase connection failed");
          }
        }
        
      } catch (error: any) {
        addLog(`❌ Firebase initialization error: ${error.message}`);
        setStatus("❌ Firebase not initialized");
      }
    };

    testFirebase();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Firebase Connection Test</h1>
      <p><strong>Status:</strong> {status}</p>
      
      <div style={{ marginTop: "20px" }}>
        <h3>Logs:</h3>
        <div style={{ 
          background: "#f5f5f5", 
          padding: "10px", 
          borderRadius: "5px",
          maxHeight: "300px",
          overflowY: "auto"
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: "5px" }}>
              {log}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h3>Firebase Config:</h3>
        <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
          {JSON.stringify({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing",
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing",
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing",
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing",
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✅ Set" : "❌ Missing",
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing",
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}