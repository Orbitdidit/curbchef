import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <div className="text-6xl mb-2">🚚</div>
                        <h1 className="text-7xl font-heading font-bold text-muted-foreground/30">404</h1>
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-2xl font-heading font-bold text-foreground">
                            Wrong Turn
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            This truck has moved on. Let's get you back to the action.
                        </p>
                    </div>
                    
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-card rounded-2xl">
                            <p className="text-sm text-muted-foreground">
                                Admin: This page hasn't been implemented yet.
                            </p>
                        </div>
                    )}
                    
                    <div className="pt-6">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-heading font-bold text-sm"
                        >
                            Back to CurbChef
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}