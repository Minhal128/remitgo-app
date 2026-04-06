export async function testBackendEndpoints() {
  const baseUrl = 'https://remitgobackend.vercel.app';
  const results: any[] = [];
  
  console.log('=== BACKEND TESTING ===');
  
  // Test endpoints
  const endpoints = [
    { path: '/health', method: 'GET', description: 'Health check' },
    { path: '/test', method: 'GET', description: 'Basic test' },
    { path: '/auth/test', method: 'GET', description: 'Auth test' },
    { path: '/users', method: 'GET', description: 'Users endpoint (should fail without auth)' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
      
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
      
      const result = {
        endpoint: endpoint.path,
        method: endpoint.method,
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries())
      };
      
      results.push(result);
      console.log(`✓ ${endpoint.path}: ${response.status} ${response.statusText}`);
      console.log('Response:', responseData);
      
    } catch (error) {
      const result = {
        endpoint: endpoint.path,
        method: endpoint.method,
        error: error.message,
        success: false
      };
      
      results.push(result);
      console.log(`✗ ${endpoint.path}: Error - ${error.message}`);
    }
  }
  
  // Test login with dummy credentials to see specific error
  try {
    console.log('Testing login with dummy credentials...');
    
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    
    const loginText = await loginResponse.text();
    let loginData;
    
    try {
      loginData = JSON.parse(loginText);
    } catch {
      loginData = loginText;
    }
    
    const loginResult = {
      endpoint: '/auth/login',
      method: 'POST',
      status: loginResponse.status,
      statusText: loginResponse.statusText,
      success: loginResponse.ok,
      data: loginData,
      headers: Object.fromEntries(loginResponse.headers.entries())
    };
    
    results.push(loginResult);
    console.log(`Login test: ${loginResponse.status} ${loginResponse.statusText}`);
    console.log('Login response:', loginData);
    
  } catch (error) {
    console.log(`Login test error: ${error.message}`);
    results.push({
      endpoint: '/auth/login',
      method: 'POST',
      error: error.message,
      success: false
    });
  }
  
  console.log('=== TESTING COMPLETE ===');
  console.log('Full results:', results);
  
  return results;
}

export async function testSpecificLogin(email: string, password: string) {
  const baseUrl = 'https://remitgobackend.vercel.app';
  
  console.log('=== SPECIFIC LOGIN TEST ===');
  console.log('Email:', email);
  console.log('Password length:', password.length);
  
  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({ email, password })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    
    console.log('Parsed response:', responseData);
    console.log('=== LOGIN TEST COMPLETE ===');
    
    return {
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries())
    };
    
  } catch (error) {
    console.log('Login test error:', error);
    return { error: error.message, success: false };
  }
}

// Default export to prevent Expo Router from treating this as a route
export default function BackendTest() {
  return null;
}
