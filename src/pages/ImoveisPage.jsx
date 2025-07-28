import React, { useState, useEffect } from 'react';

// Garanta que você tem o arquivo .env.local na raiz do seu projeto frontend
// com a linha: VITE_API_BASE_URL=http://127.0.0.1:8000
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/imoveis/`;

// =================================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =================================================================================
function ImoveisPage() {
    // --- ESTADOS (STATE) ---
    const [imoveis, setImoveis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para controlar o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'details' ou 'form'
    const [selectedImovel, setSelectedImovel] = useState(null);

    // --- LÓGICA DE DADOS (API) ---
    const fetchImoveis = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Falha ao buscar dados da API. Verifique se o backend Django está rodando.');
            const data = await response.json();
            setImoveis(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Executa a busca de dados quando o componente é montado pela primeira vez
    useEffect(() => {
        fetchImoveis();
    }, []);

    // --- MANIPULADORES DE EVENTOS (HANDLERS) ---
    const handleOpenDetails = (imovel) => {
        setSelectedImovel(imovel);
        setModalType('details');
        setIsModalOpen(true);
    };

    const handleOpenForm = (imovel = null) => {
        setSelectedImovel(imovel);
        setModalType('form');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedImovel(null);
        setModalType(null);
    };

    const handleDelete = async (imovelId) => {
        if (window.confirm('Tem certeza que deseja excluir este imóvel? A ação não pode ser desfeita.')) {
            try {
                const response = await fetch(`${API_URL}${imovelId}/`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir o imóvel.');
                handleCloseModal();
                await fetchImoveis(); // Atualiza a lista
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleFormSuccess = () => {
        handleCloseModal();
        fetchImoveis(); // Atualiza a lista após criar/editar
    };
    
    // --- RENDERIZAÇÃO PRINCIPAL ---
    if (error) return <div className="p-8 text-center text-red-400">Erro: {error}</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Gestão de Imóveis</h2>
                <button onClick={() => handleOpenForm(null)} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition">+ Novo Imóvel</button>
            </div>

            {loading ? <div className="text-center text-gray-500 py-10">Carregando...</div> : (
                <ImoveisTable imoveis={imoveis} onOpenDetails={handleOpenDetails} />
            )}
            
            {isModalOpen && (
                <Modal onClose={handleCloseModal} title={
                    modalType === 'form' 
                        ? (selectedImovel ? `Editar Imóvel #${selectedImovel.id}` : 'Adicionar Novo Imóvel') 
                        : `Detalhes do Imóvel #${selectedImovel.id}`
                }>
                    {modalType === 'details' && (
                        <ImovelDetails 
                            imovel={selectedImovel} 
                            onEdit={() => handleOpenForm(selectedImovel)}
                            onDelete={() => handleDelete(selectedImovel.id)}
                            onClose={handleCloseModal}
                        />
                    )}
                    {modalType === 'form' && (
                        <ImovelForm 
                            imovelData={selectedImovel} 
                            onSuccess={handleFormSuccess}
                            onClose={handleCloseModal}
                        />
                    )}
                </Modal>
            )}
        </>
    );
}

export default ImoveisPage;


// =================================================================================
// SUB-COMPONENTES (Peças da Interface)
// =================================================================================

function ImoveisTable({ imoveis, onOpenDetails }) {
    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-900 text-gray-400 uppercase">
                    <tr>
                        <th className="p-4">Endereço</th>
                        <th className="p-4">Tipo</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Aluguel</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {imoveis.map(imovel => (
                        <tr key={imovel.id} className="border-b border-gray-700 hover:bg-gray-700">
                            <td className="p-4 text-gray-200 truncate max-w-xs">{imovel.endereco}</td>
                            <td className="p-4 text-gray-400">{imovel.tipo_imovel}</td>
                            <td className="p-4 text-gray-400">{imovel.status_imovel}</td>
                            <td className="p-4 text-gray-400">R$ {parseFloat(imovel.valor_aluguel).toLocaleString('pt-BR')}</td>
                            <td className="p-4 text-right">
                                <button onClick={() => onOpenDetails(imovel)} className="text-orange-500 hover:text-orange-400 font-semibold">Ver Detalhes</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Modal({ children, onClose, title }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-gray-800 rounded-xl shadow-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-700">
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ImovelDetails({ imovel, onEdit, onDelete, onClose }) {
    return (
        <>
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-gray-300">
                    {Object.entries(imovel).map(([key, value]) => (
                        <div key={key}>
                            <p className="text-sm text-gray-500 font-semibold capitalize">{key.replace(/_/g, ' ')}</p>
                            <p className="text-lg">{value !== null && value !== '' ? String(value) : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-shrink-0 p-6 border-t border-gray-700 flex justify-between items-center">
                <button onClick={onDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Deletar</button>
                <div>
                    <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 mr-2">Fechar</button>
                    <button onClick={onEdit} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600">Editar</button>
                </div>
            </div>
        </>
    );
}

function ImovelForm({ imovelData, onSuccess, onClose }) {
    const [formData, setFormData] = useState(imovelData || {
        tipo_imovel: 'Apartamento', status_imovel: 'Disponível', endereco: '', descricao: '',
        valor_aluguel: '', valor_venda: '', area_util: '', area_total: '', andar: '',
        numero_quartos: '', numero_banheiros: '', vagas_garagem: '', condominio_valor: '', iptu_valor: '',
        codigo_energia: '', codigo_agua: '', administradora_condominio: '', data_aquisicao: '',
        data_venda: '', valor_aquisicao: '', imposto_venda: '', valor_liquido_venda: '',
        valor_liquido_aluguel: '', tipo_garantia: 'Caução', seguro_vencimento: '', seguro_corretora: '',
        seguro_seguradora: '', seguro_valor: '', imagens: ''
    });
    const [formError, setFormError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        const isEditing = !!imovelData;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}${imovelData.id}/` : API_URL;
        
        const cleanedData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
        );

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cleanedData) });
            if (!response.ok) {
                const errData = await response.json();
                const errorString = Object.entries(errData).map(([k,v]) => `${k}: ${v}`).join('; ');
                throw new Error(errorString);
            }
            onSuccess();
        } catch(err) {
            setFormError(`Erro ao salvar: ${err.message}`);
        }
    };
    
    // Função auxiliar para renderizar campos do formulário
    const renderField = (fieldConfig) => {
        // CORREÇÃO: Aumentado o padding de p-2 para p-2.5
        const commonProps = {
            name: fieldConfig.key,
            value: formData[fieldConfig.key] || '',
            onChange: handleChange,
            className: "w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white", // Padding aumentado
            required: fieldConfig.required,
        };
        if (fieldConfig.type === 'select') {
            return (
                <select {...commonProps}>
                    {fieldConfig.options.map(opt => <option key={opt[0]} value={opt[0]}>{opt[1]}</option>)}
                </select>
            );
        }
        if (fieldConfig.type === 'textarea') {
            return <textarea {...commonProps}></textarea>
        }
        return <input type={fieldConfig.type} step={fieldConfig.step} {...commonProps} />
    };

    // Configuração dos campos para o gerador de formulário
    const formFieldsConfig = [
        { key: 'endereco', label: 'Endereço Completo', type: 'text', required: true, colSpan: 2 },
        { key: 'tipo_imovel', label: 'Tipo de Imóvel', type: 'select', required: true, options: [['Casa', 'Casa'], ['Apartamento', 'Apartamento'], ['Sala Comercial', 'Sala Comercial']]},
        { key: 'status_imovel', label: 'Status', type: 'select', required: true, options: [['Disponível', 'Disponível'], ['Alugado', 'Alugado'], ['Vendido', 'Vendido']]},
        { key: 'descricao', label: 'Descrição', type: 'textarea', colSpan: 2 },
        { key: 'valor_aluguel', label: 'Valor do Aluguel', type: 'number', step: '0.01', required: true },
        { key: 'valor_liquido_aluguel', label: 'Valor Líquido Aluguel', type: 'number', step: '0.01' }, // NOVO CAMPO
        { key: 'valor_venda', label: 'Valor de Venda', type: 'number', step: '0.01' },
        { key: 'imposto_venda', label: 'Imposto sobre Venda', type: 'number', step: '0.01' }, // NOVO CAMPO
        { key: 'valor_liquido_venda', label: 'Valor Líquido da Venda', type: 'number', step: '0.01' },
        { key: 'condominio_valor', label: 'Valor do Condomínio', type: 'number', step: '0.01' },
        { key: 'iptu_valor', label: 'Valor do IPTU', type: 'number', step: '0.01' },
        { key: 'area_util', label: 'Área Útil (m²)', type: 'number', required: true },
        { key: 'area_total', label: 'Área Total (m²)', type: 'number' },
        { key: 'andar', label: 'Andar', type: 'number' },
        { key: 'numero_quartos', label: 'Quartos', type: 'number' },
        { key: 'vagas_garagem', label: 'Vagas de Garagem', type: 'number' },
        { key: 'numero_banheiros', label: 'Banheiros', type: 'number' },
        { key: 'codigo_energia', label: 'Código de Energia', type: 'text' },
        { key: 'codigo_agua', label: 'Código de Água', type: 'text' },
        { key: 'administradora_condominio', label: 'Administradora do Condomínio', type: 'text' },
        { key: 'data_aquisicao', label: 'Data de Aquisição', type: 'date' },
        { key: 'valor_aquisicao', label: 'Valor de Aquisição', type: 'number', step: '0.01' },
        { key: 'data_venda', label: 'Data da Venda', type: 'date' },
        { key: 'seguro_vencimento', label: 'Vencimento do Seguro', type: 'date' },
        { key: 'seguro_corretora', label: 'Corretora do Seguro', type: 'text' },
        { key: 'seguro_seguradora', label: 'Seguradora', type: 'text' },
        { key: 'seguro_valor', label: 'Valor do Seguro', type: 'number', step: '0.01' },
    ];

    return (
        <form onSubmit={handleSubmit} id="modal-form" className="flex flex-col h-full overflow-hidden">
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                {/* CORREÇÃO: Removido lg:grid-cols-3 para ter no máximo 2 colunas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formFieldsConfig.map(field => (
                        <div key={field.key} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
                            <label className="text-sm text-gray-400">{field.label}</label>
                            {renderField(field)}
                        </div>
                    ))}
                </div>
                {formError && <div className="text-red-400 mt-4 text-center">{formError}</div>}
            </div>
            <div className="flex-shrink-0 p-6 border-t border-gray-700 text-right">
                <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 ml-2">Salvar</button>
            </div>
        </form>
    );
}