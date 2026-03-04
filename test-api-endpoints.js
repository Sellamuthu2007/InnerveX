// Quick API Endpoint Test Script
// Run with: node test-api-endpoints.js

const API_URL = 'http://localhost:3001';

// Test data
const testUser = {
    name: 'API Test User',
    email: `apitest${Date.now()}@example.com`,
    password: 'Test1234',
    role: 'individual'
};

const testInstitution = {
    name: 'API Test University',
    email: `institution${Date.now()}@example.com`,
    password: 'Test1234',
    role: 'institution'
};

let userToken = '';
let institutionToken = '';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        return {
            success: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Test functions
async function testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    const result = await apiCall('/health');
    
    if (result.success && result.data.status === 'healthy') {
        console.log('✅ Health check passed');
        return true;
    } else {
        console.log('❌ Health check failed:', result);
        return false;
    }
}

async function testUserSignup() {
    console.log('\n👤 Testing User Signup...');
    
    // Test individual signup
    const userResult = await apiCall('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify(testUser)
    });
    
    if (userResult.success && userResult.data.token) {
        userToken = userResult.data.token;
        console.log('✅ Individual signup successful');
        console.log(`   User ID: ${userResult.data.user._id}`);
        console.log(`   Wallet ID: ${userResult.data.user.walletId}`);
    } else {
        console.log('❌ Individual signup failed:', userResult);
        return false;
    }
    
    // Test institution signup
    const instResult = await apiCall('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify(testInstitution)
    });
    
    if (instResult.success && instResult.data.token) {
        institutionToken = instResult.data.token;
        console.log('✅ Institution signup successful');
        console.log(`   Institution ID: ${instResult.data.user._id}`);
    } else {
        console.log('❌ Institution signup failed:', instResult);
        return false;
    }
    
    return true;
}

async function testUserVerification() {
    console.log('\n🔍 Testing User Verification...');
    
    const result = await apiCall('/api/v1/users/verify', {
        method: 'POST',
        body: JSON.stringify({ name: testUser.name })
    });
    
    if (result.success && result.data.success) {
        console.log('✅ User verification successful');
        console.log(`   Found user: ${result.data.name}`);
        console.log(`   Email: ${result.data.email}`);
        return true;
    } else {
        console.log('❌ User verification failed:', result);
        return false;
    }
}

async function testOTPSystem() {
    console.log('\n📱 Testing OTP System...');
    
    // Test OTP send
    const sendResult = await apiCall('/api/v1/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email: testUser.email })
    });
    
    if (sendResult.success) {
        console.log('✅ OTP send successful');
        console.log(`   Expires in: ${sendResult.data.expiresIn} seconds`);
    } else {
        console.log('❌ OTP send failed:', sendResult);
        return false;
    }
    
    // Test OTP verify (will fail with random OTP, but tests endpoint)
    const verifyResult = await apiCall('/api/v1/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ 
            email: testUser.email, 
            otp: '123456' // This will likely fail, but tests the endpoint
        })
    });
    
    console.log('📝 OTP verify test (expected to fail with random OTP):', 
        verifyResult.success ? '✅ Passed' : '❌ Failed (expected)');
    
    return true;
}

async function testCertificateIssuance() {
    console.log('\n📜 Testing Certificate Issuance...');
    
    // Create a simple base64 PDF for testing
    const testPDF = 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOgCjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQNC4xOTQgVGVzdCBQREYKZW5kc3RyZWFtCmVuZG9iago=';
    
    const certData = {
        title: 'API Test Certificate',
        recipientName: testUser.name,
        recipientEmail: testUser.email,
        fileData: testPDF,
        fileName: 'test-certificate.pdf',
        fileType: 'application/pdf'
    };
    
    const result = await apiCall('/api/v1/certificates', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${institutionToken}`
        },
        body: JSON.stringify(certData)
    });
    
    if (result.success) {
        console.log('✅ Certificate issuance successful');
        console.log(`   Certificate ID: ${result.data.certificate._id}`);
        console.log(`   Status: ${result.data.certificate.status}`);
        console.log(`   Hash: ${result.data.certificate.certificateHash}`);
        return result.data.certificate._id;
    } else {
        console.log('❌ Certificate issuance failed:', result);
        return null;
    }
}

async function testCertificateRetrieval() {
    console.log('\n📋 Testing Certificate Retrieval...');
    
    // Test getting user's certificates
    const userCertsResult = await apiCall('/api/v1/certificates/my', {
        headers: {
            'Authorization': `Bearer ${userToken}`
        }
    });
    
    if (userCertsResult.success) {
        console.log('✅ User certificates retrieval successful');
        console.log(`   Found ${userCertsResult.data.certificates.length} certificates`);
    } else {
        console.log('❌ User certificates retrieval failed:', userCertsResult);
    }
    
    // Test getting institution's issued certificates
    const instCertsResult = await apiCall('/api/v1/certificates/issued', {
        headers: {
            'Authorization': `Bearer ${institutionToken}`
        }
    });
    
    if (instCertsResult.success) {
        console.log('✅ Institution certificates retrieval successful');
        console.log(`   Issued ${instCertsResult.data.certificates.length} certificates`);
        return true;
    } else {
        console.log('❌ Institution certificates retrieval failed:', instCertsResult);
        return false;
    }
}

async function testRequestSystem() {
    console.log('\n📝 Testing Request System...');
    
    // Create a certificate request
    const requestData = {
        title: 'API Test Request',
        institutionName: testInstitution.name
    };
    
    const createResult = await apiCall('/api/v1/requests', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(requestData)
    });
    
    if (createResult.success) {
        console.log('✅ Request creation successful');
        console.log(`   Request ID: ${createResult.data.request._id}`);
        console.log(`   Status: ${createResult.data.request.status}`);
        
        // Test getting institution's requests
        const instRequestsResult = await apiCall('/api/v1/requests/institution', {
            headers: {
                'Authorization': `Bearer ${institutionToken}`
            }
        });
        
        if (instRequestsResult.success) {
            console.log('✅ Institution requests retrieval successful');
            console.log(`   Found ${instRequestsResult.data.requests.length} requests`);
            return createResult.data.request._id;
        }
    } else {
        console.log('❌ Request creation failed:', createResult);
    }
    
    return null;
}

async function testNotifications() {
    console.log('\n🔔 Testing Notifications...');
    
    // Test getting user notifications
    const userNotifResult = await apiCall('/api/v1/notifications', {
        headers: {
            'Authorization': `Bearer ${userToken}`
        }
    });
    
    if (userNotifResult.success) {
        console.log('✅ User notifications retrieval successful');
        console.log(`   Found ${userNotifResult.data.notifications.length} notifications`);
    } else {
        console.log('❌ User notifications retrieval failed:', userNotifResult);
    }
    
    // Test getting institution notifications
    const instNotifResult = await apiCall('/api/v1/notifications', {
        headers: {
            'Authorization': `Bearer ${institutionToken}`
        }
    });
    
    if (instNotifResult.success) {
        console.log('✅ Institution notifications retrieval successful');
        console.log(`   Found ${instNotifResult.data.notifications.length} notifications`);
        return true;
    } else {
        console.log('❌ Institution notifications retrieval failed:', instNotifResult);
        return false;
    }
}

async function testPublicVerification(certificateId) {
    if (!certificateId) {
        console.log('\n⚠️ Skipping public verification (no certificate ID)');
        return true;
    }
    
    console.log('\n🔍 Testing Public Verification...');
    
    const result = await apiCall(`/api/v1/certificates/verify/${certificateId}`);
    
    if (result.success && result.data.valid) {
        console.log('✅ Public verification successful');
        console.log(`   Certificate: ${result.data.certificate.title}`);
        console.log(`   Issuer: ${result.data.certificate.issuerName}`);
        console.log(`   Status: ${result.data.certificate.status}`);
        return true;
    } else {
        console.log('❌ Public verification failed:', result);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting InnerveX API Tests...');
    console.log('=====================================');
    
    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'User Signup', fn: testUserSignup },
        { name: 'User Verification', fn: testUserVerification },
        { name: 'OTP System', fn: testOTPSystem },
        { name: 'Certificate Issuance', fn: testCertificateIssuance },
        { name: 'Certificate Retrieval', fn: testCertificateRetrieval },
        { name: 'Request System', fn: testRequestSystem },
        { name: 'Notifications', fn: testNotifications }
    ];
    
    let passed = 0;
    let failed = 0;
    let certificateId = null;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (test.name === 'Certificate Issuance' && result) {
                certificateId = result;
            }
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} threw error:`, error.message);
            failed++;
        }
    }
    
    // Run public verification if we have a certificate
    try {
        const verifyResult = await testPublicVerification(certificateId);
        if (verifyResult) passed++;
        else failed++;
    } catch (error) {
        console.log('❌ Public verification threw error:', error.message);
        failed++;
    }
    
    console.log('\n=====================================');
    console.log('🎯 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! API is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the logs above for details.');
    }
    
    console.log('\n📝 Test Users Created:');
    console.log(`   Individual: ${testUser.email}`);
    console.log(`   Institution: ${testInstitution.email}`);
    console.log('   Password for both: Test1234');
}

// Check if we're running in Node.js
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    runAllTests().catch(console.error);
} else {
    // Browser environment
    console.log('Copy and paste this script into your browser console to run tests');
}

// Export for browser use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests };
}