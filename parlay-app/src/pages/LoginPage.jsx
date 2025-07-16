import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await fetch('http://localhost:5001/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/home');
            } else {
                alert('Google login failed.');
            }
        } catch (error) {
            console.error('Google login error:', error);
            alert('Google login failed.');
        }
    };

    return (
        <div className="login-page">
            <h2>Welcome to your Parlay Tracker!</h2>
            <p>Sign in with Google to continue</p>
            <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => alert('Google Login Failed')}
            />
        </div>
    );
};

export default LoginPage;
