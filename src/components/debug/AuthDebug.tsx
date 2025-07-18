import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results: any = {};
    
    try {
      // Test 1: Basic connection
      console.log('Testing basic connection...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      results.basicConnection = {
        success: !sessionError,
        error: sessionError?.message,
        data: sessionData ? 'Session data present' : 'No session'
      };

      // Test 2: Check if profiles table exists
      console.log('Testing profiles table...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      results.profilesTable = {
        success: !profilesError,
        error: profilesError?.message,
        code: profilesError?.code
      };

      // Test 3: Test RPC functions
      console.log('Testing RPC functions...');
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_profile');
        results.rpcFunctions = {
          success: !rpcError,
          error: rpcError?.message,
          code: rpcError?.code
        };
      } catch (rpcErr: any) {
        results.rpcFunctions = {
          success: false,
          error: rpcErr.message,
          code: rpcErr.code
        };
      }

      // Test 4: Test signup
      console.log('Testing signup capability...');
      try {
        // This won't actually create a user, just test the endpoint
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: 'test@example.com',
          password: 'testpassword123',
          options: {
            data: {
              first_name: 'Test',
              last_name: 'User'
            }
          }
        });
        
        results.signupTest = {
          success: !signupError || signupError.message.includes('already registered'),
          error: signupError?.message,
          code: signupError?.code
        };
      } catch (signupErr: any) {
        results.signupTest = {
          success: false,
          error: signupErr.message,
          code: signupErr.code
        };
      }

    } catch (error: any) {
      results.generalError = {
        success: false,
        error: error.message
      };
    }

    setTestResults(results);
    
    // Set debug info
    setDebugInfo({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      timestamp: new Date().toISOString()
    });
  };

  const testSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });
      
      console.log('Signup test result:', { data, error });
      alert(`Signup test: ${error ? `Error: ${error.message}` : 'Success'}`);
    } catch (err: any) {
      console.error('Signup test error:', err);
      alert(`Signup test error: ${err.message}`);
    }
  };

  const testLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      console.log('Login test result:', { data, error });
      alert(`Login test: ${error ? `Error: ${error.message}` : 'Success'}`);
    } catch (err: any) {
      console.error('Login test error:', err);
      alert(`Login test error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Debug Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Configuration</h2>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Test Results */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Test Results</h2>
          <div className="space-y-3">
            {Object.entries(testResults).map(([test, result]: [string, any]) => (
              <div key={test} className={`p-3 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="font-medium">{test}</div>
                <div className="text-sm mt-1">
                  Status: {result.success ? '✅ Success' : '❌ Failed'}
                </div>
                {result.error && (
                  <div className="text-sm text-red-600 mt-1">
                    Error: {result.error}
                  </div>
                )}
                {result.code && (
                  <div className="text-sm text-gray-600 mt-1">
                    Code: {result.code}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mt-6 space-x-4">
        <button
          onClick={runDiagnostics}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Run Diagnostics
        </button>
        <button
          onClick={testSignup}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Signup
        </button>
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Test Login
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;