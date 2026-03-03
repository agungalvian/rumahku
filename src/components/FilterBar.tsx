import React from 'react';
import { Search, MapPin } from 'lucide-react';

interface FilterBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterType: 'All' | 'Komersial' | 'Subsidi';
    setFilterType: (type: 'All' | 'Komersial' | 'Subsidi') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    searchTerm, setSearchTerm, filterType, setFilterType
}) => {
    return (
        <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div className="flex gap-2 mb-3">
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Cari perumahan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '35px' }}
                    />
                </div>
                <button className="btn btn-primary" style={{ padding: '0 1rem' }}>
                    <MapPin size={18} />
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto" style={{ paddingBottom: '4px' }}>
                <button
                    className={`btn ${filterType === 'All' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '14px' }}
                    onClick={() => setFilterType('All')}
                >
                    Semua
                </button>
                <button
                    className={`btn ${filterType === 'Subsidi' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '14px' }}
                    onClick={() => setFilterType('Subsidi')}
                >
                    Subsidi
                </button>
                <button
                    className={`btn ${filterType === 'Komersial' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '14px' }}
                    onClick={() => setFilterType('Komersial')}
                >
                    Komersial
                </button>
            </div>
        </div>
    );
};

export default FilterBar;
