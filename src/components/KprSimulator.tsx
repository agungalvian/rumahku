import { useState } from 'react';
import type { PropertyType } from '../data/mockData';

interface KprSimulatorProps {
    propertyPrice: number;
    propertyType: PropertyType;
}

const KprSimulator: React.FC<KprSimulatorProps> = ({ propertyPrice, propertyType }) => {
    const isSubsidi = propertyType === 'Subsidi';

    const [dpPercentage, setDpPercentage] = useState(isSubsidi ? 1 : 20); // Subsidi DP minimum 1%
    const [tenor, setTenor] = useState(15); // in years
    const [interestRate, setInterestRate] = useState(isSubsidi ? 5 : 8); // Flat 5% for subsidi, 8% floating for komersial

    const dpAmount = (propertyPrice * dpPercentage) / 100;
    const principal = propertyPrice - dpAmount;

    // Basic PMT Formula for fixed rate: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyRate = (interestRate / 100) / 12;
    const numPayments = tenor * 12;
    const baseInstallment = principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);

    // "Biaya Siluman" / Ekstra Cost Estimations
    const adminFee = isSubsidi ? 500000 : 2000000;
    const notaryFee = propertyPrice * 0.01;
    const taxBPHTB = Math.max(0, (propertyPrice - 60000000) * 0.05); // Standard BPHTB (Price - NPOPTKP) * 5% -> Simplified constraint map
    const totalFees = dpAmount + adminFee + notaryFee + taxBPHTB;

    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="card p-4 mt-6">
            <h3 className="font-bold text-lg mb-4">Simulasi KPR</h3>

            <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-primary-dark" style={{ backgroundColor: 'var(--primary-light)' }}>
                <p><strong>Informasi Skema:</strong> Anda memilih rumah {propertyType}. {isSubsidi ? "Suku bunga ditetapkan flat 5% (Program FLPP BPTapera)." : "Suku bunga yang ditampilkan adalah estimasi floating rate."}</p>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                <div>
                    <label className="text-sm font-semibold mb-1 block">Uang Muka (DP) - {dpPercentage}%</label>
                    <input
                        type="range"
                        min={isSubsidi ? 1 : 10}
                        max="50"
                        value={dpPercentage}
                        onChange={(e) => setDpPercentage(Number(e.target.value))}
                        className="w-full"
                        style={{ width: '100%' }}
                    />
                    <div className="text-muted text-sm text-right mt-1">{formatIDR(dpAmount)}</div>
                </div>

                <div>
                    <label className="text-sm font-semibold mb-1 block">Jangka Waktu (Tenor)</label>
                    <select value={tenor} onChange={(e) => setTenor(Number(e.target.value))}>
                        <option value={10}>10 Tahun</option>
                        <option value={15}>15 Tahun</option>
                        <option value={20}>20 Tahun</option>
                        {isSubsidi && <option value={25}>25 Tahun</option>}
                    </select>
                </div>

                {!isSubsidi && (
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Suku Bunga Estimasi (%)</label>
                        <input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            step="0.1"
                            min="1"
                        />
                    </div>
                )}
            </div>

            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '1rem 0' }}></div>

            <h4 className="font-semibold mb-2">Estimasi Pembayaran Awal</h4>
            <div className="text-sm flex flex-col gap-2 mb-4">
                <div className="flex justify-between"><span>Uang Muka (DP)</span> <span>{formatIDR(dpAmount)}</span></div>
                <div className="flex justify-between"><span>Biaya Admin Bank</span> <span>{formatIDR(adminFee)}</span></div>
                <div className="flex justify-between"><span>Biaya Notaris (est)</span> <span>{formatIDR(notaryFee)}</span></div>
                <div className="flex justify-between"><span>Pajak Pembeli (BPHTB)</span> <span>{formatIDR(taxBPHTB)}</span></div>
                <div className="flex justify-between font-bold text-base mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <span>Total Siapkan Dana</span> <span>{formatIDR(totalFees)}</span>
                </div>
            </div>

            <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <p className="text-sm font-medium mb-1">Estimasi Cicilan per Bulan</p>
                <p className="text-2xl font-bold text-success">{formatIDR(baseInstallment)}</p>
            </div>
        </div>
    );
};

export default KprSimulator;
