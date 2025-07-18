import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

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
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
            </div>
            <Card className="w-full max-w-md shadow-lg border-none bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-col items-center gap-2 pb-0">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg mb-2 flex items-center justify-center">
                        <Target className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 text-center">Parlay Tracker</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 pt-2 pb-8">
                    <div className="w-full text-center">
                        <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
                        <p className="text-gray-600 mb-6">Sign in with Google to continue</p>
                    </div>
                    <div className="w-full flex flex-col items-center gap-4">
                        <div className="relative w-[240px] h-[40px]">
                            {/* Visually hidden GoogleLogin, but accessible for screen readers and click events */}
                            <div className="absolute inset-0 w-[240px] h-[40px] opacity-0 z-20 cursor-pointer" tabIndex={-1} aria-hidden="false" style={{ pointerEvents: 'auto' }}>
                                <GoogleLogin
                                    onSuccess={handleGoogleLogin}
                                    onError={() => alert('Google Login Failed')}
                                    width="240"
                                />
                            </div>
                            {/* Custom styled button overlays the GoogleLogin button */}
                            <button
                                type="button"
                                className="w-[240px] h-[40px] flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-base select-none"
                                tabIndex={-1}
                                aria-label="Sign in with Google"
                                style={{ pointerEvents: 'none' }}
                            >
                                <svg className="h-6 w-6" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.54 30.77 0 24 0 14.82 0 6.71 5.1 2.69 12.44l7.98 6.2C12.13 13.16 17.62 9.5 24 9.5z" /><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z" /><path fill="#FBBC05" d="M10.67 28.65c-1.01-2.98-1.01-6.18 0-9.16l-7.98-6.2C.99 17.1 0 20.43 0 24c0 3.57.99 6.9 2.69 10.01l7.98-6.2z" /><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.19-5.6c-2.01 1.35-4.6 2.15-8.7 2.15-6.38 0-11.87-3.66-14.33-8.95l-7.98 6.2C6.71 42.9 14.82 48 24 48z" /><path fill="none" d="M0 0h48v48H0z" /></g></svg>
                                <span>Sign in with Google</span>
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
