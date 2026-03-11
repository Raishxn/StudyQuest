async function test() {
    console.log('Registering user...');
    const registerResponse = await fetch('https://studyquest-g802.onrender.com/auth/register/phase1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'testagent123' + Date.now() + '@example.com',
            username: 'at' + Date.now().toString().slice(-10),
            password: 'Password123!',
            name: 'Agent Test'
        })
    });
    console.log('Register status:', registerResponse.status);
    const registerData = await registerResponse.json();

    const token = registerData.accessToken;
    if (!token) {
        console.error('No token received:', registerData);
        return;
    }

    console.log('Updating profile...');
    const patchResponse = await fetch('https://studyquest-g802.onrender.com/users/me', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: "Erick Machado",
            username: "erick_machado_1",
            avatarUrl: "https://example.com/avatar.jpg",
            unidade: "Campus Central UFRJ",
            semester: 5,
            shift: "MORNING"
        })
    });

    console.log('Profile update status:', patchResponse.status);
    const patchData = await patchResponse.json();
    console.log('Profile update data:', patchData);
}

test().catch(console.error);
