// Quick test to check if backend is running
const http = require('http');

console.log('🧪 Testing InnerveX Backend...\n');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/health',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`✅ Backend is running!`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`\n📊 Response:`, JSON.parse(data));
        console.log('\n✅ Backend is working correctly!');
        console.log('\n⚠️  If you still see CORS errors:');
        console.log('   1. Stop the backend (Ctrl+C)');
        console.log('   2. Run: npm run dev');
        console.log('   3. Refresh your browser\n');
    });
});

req.on('error', (error) => {
    console.log('❌ Backend is NOT running!');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 To fix:');
    console.log('   1. Open terminal');
    console.log('   2. cd backend');
    console.log('   3. npm run dev\n');
});

req.end();
