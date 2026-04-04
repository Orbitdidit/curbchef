import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, ChefHat, CheckCircle, MapPin } from 'lucide-react';

const steps = [
  { key: 'placed', icon: Package, label: 'Order Placed' },
  { key: 'preparing', icon: ChefHat, label: 'Preparing' },
  { key: 'ready', icon: CheckCircle, label: 'Ready for Pickup' },
];

export default function OrderDetail() {
  const navigate = useNavigate();
  const orderId = window.location.pathname.split('/order/')[1];

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      return orders[0];
    },
    enabled: !!orderId,
    refetchInterval: 10000,
  });

  if (isLoading || !order) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentStep = steps.findIndex(s => s.key === order.status);

  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading font-bold text-lg">Order Details</h1>
      </div>

      {/* Status tracker */}
      <div className="bg-card rounded-3xl p-5 mb-4">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i <= currentStep;
            const isCurrent = i === currentStep;
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCurrent ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
                    isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-medium text-center max-w-[60px] ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded ${i < currentStep ? 'bg-primary' : 'bg-secondary'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {order.status === 'ready' && (
          <div className="bg-primary/10 rounded-2xl p-4 text-center">
            <p className="text-primary font-bold text-sm mb-1">Your order is ready!</p>
            <p className="text-4xl font-heading font-bold text-primary tracking-widest">{order.pickup_code}</p>
            <p className="text-xs text-muted-foreground mt-1">Show this code at pickup</p>
          </div>
        )}
      </div>

      {/* Order info */}
      <div className="bg-card rounded-3xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-heading font-bold text-sm">{order.truck_name}</span>
        </div>
        <div className="space-y-2.5">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="h-px bg-border" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${order.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tip</span>
            <span>${order.tip?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-heading font-bold">
            <span>Total</span>
            <span className="text-primary">${order.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Pickup Time</span>
          <span>{order.pickup_time}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payment</span>
          <span className="capitalize">{order.payment_method?.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
}