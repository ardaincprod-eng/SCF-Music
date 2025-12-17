import React, { useState, useEffect } from 'react';
import { PaymentDetails } from '../types';
import { CreditCardIcon, SaveIcon, GlobeIcon, CheckCircleIcon } from './icons/Icons';

interface CardsProps {
    userId: string;
}

export const Cards: React.FC<CardsProps> = ({ userId }) => {
    // State for fields
    const [paypalEmail, setPaypalEmail] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [country, setCountry] = useState('');
    const [isEditing, setIsEditing] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(`scf_payment_${userId}`);
            if (savedData) {
                const details: PaymentDetails = JSON.parse(savedData);
                setPaypalEmail(details.paypalEmail);
                setStreet(details.street);
                setCity(details.city);
                setState(details.state);
                setZipCode(details.zipCode);
                setCountry(details.country);
                setIsEditing(false);
            }
        } catch (e) {
            console.error("Error loading payment details", e);
        }
    }, [userId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const details: PaymentDetails = { paypalEmail, street, city, state, zipCode, country };
        
        try {
            localStorage.setItem(`scf_payment_${userId}`, JSON.stringify(details));
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (e) {
            alert('Failed to save details');
        }
    };

    const inputClasses = "w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all text-white placeholder-slate-500 shadow-inner";
    const labelClasses = "block text-sm font-medium text-slate-300 mb-1.5";

    return (
        <div className="max-w-4xl mx-auto">
             <div className="text-center mb-10">
                <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    Payout Methods
                </h2>
                <p className="text-slate-400 mt-2">Manage your payment details for royalty payouts.</p>
            </div>
            
            {showSuccess && (
                <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-300 p-4 rounded-xl flex items-center justify-center animate-pulse">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Payment details saved successfully!
                </div>
            )}

            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                     <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <CreditCardIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">PayPal Details</h3>
                            <p className="text-sm text-slate-400">Primary method for receiving monthly royalties.</p>
                        </div>
                     </div>
                     {!isEditing && (
                         <button 
                            onClick={() => setIsEditing(true)} 
                            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-600 shadow-md"
                        >
                             Edit Details
                         </button>
                     )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-slate-800/20 p-6 rounded-xl border border-blue-500/20">
                            <h4 className="text-lg font-semibold text-blue-200 mb-4 flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>
                                Payment Information
                            </h4>
                            <div>
                                <label className={labelClasses}>PayPal Email Address</label>
                                <input 
                                    type="email" 
                                    value={paypalEmail} 
                                    onChange={(e) => setPaypalEmail(e.target.value)} 
                                    className={inputClasses} 
                                    placeholder="your-email@paypal.com"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="bg-slate-800/20 p-6 rounded-xl border border-purple-500/20">
                            <h4 className="text-lg font-semibold text-purple-200 mb-4 flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></span>
                                Billing Address
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Street Address</label>
                                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClasses} required />
                                </div>
                                <div>
                                    <label className={labelClasses}>City</label>
                                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClasses} required />
                                </div>
                                <div>
                                    <label className={labelClasses}>State / Province</label>
                                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputClasses} required />
                                </div>
                                <div>
                                    <label className={labelClasses}>Zip / Postal Code</label>
                                    <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className={inputClasses} required />
                                </div>
                                <div>
                                    <label className={labelClasses}>Country</label>
                                    <div className="relative">
                                        <GlobeIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                                        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={`${inputClasses} pl-10`} required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button 
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center"
                            >
                                <SaveIcon className="h-5 w-5 mr-2" />
                                Save Payment Details
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">PayPal Email</p>
                                <p className="text-lg text-white font-medium">{paypalEmail}</p>
                            </div>
                            <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                                <div className="flex items-center text-green-400 font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                    Active & Verified
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-950/30 p-6 rounded-xl border border-white/5">
                             <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Billing Address</p>
                             <div className="flex items-start">
                                 <div className="bg-purple-500/20 p-2 rounded-lg mr-4">
                                    <GlobeIcon className="h-5 w-5 text-purple-400" />
                                 </div>
                                 <p className="text-slate-300 leading-relaxed font-mono">
                                    {street}<br />
                                    {city}, {state} {zipCode}<br />
                                    {country}
                                 </p>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}