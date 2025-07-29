import React, { useState, useEffect } from 'react';

// Garanta que você tem o arquivo .env.local na raiz do seu projeto frontend
// com a linha: VITE_API_BASE_URL=http://127.0.0.1:8000
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/imoveis/`;

// =================================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =================================================================================
function ImoveisPage() {
    const [imoveis, setImoveis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedImovel, setSelectedImovel] = useState(null);

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

    useEffect(() => {
        fetchImoveis();
    }, []);

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
                await fetchImoveis();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleFormSuccess = () => {
        handleCloseModal();
        fetchImoveis();
    };
    
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
                        {/* 1. MUDANÇA AQUI: de 'Endereço' para 'Descrição' */}
                        <th className="p-4">Descrição</th>
                        <th className="p-4">Tipo</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Aluguel</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {imoveis.map(imovel => (
                        <tr key={imovel.id} className="border-b border-gray-700 hover:bg-gray-700">
                            {/* 2. MUDANÇA AQUI: de 'imovel.endereco' para 'imovel.descricao' */}
                            <td className="p-4 text-gray-200 truncate max-w-xs">{imovel.descricao || 'Sem descrição'}</td>
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
    const commercialFields = [
        'avcb_codigo', 'avcb_emissao', 'avcb_vencimento', 
        'vencimento_extintores', 'vencimento_dedetizacao', 'vencimento_caixa_dagua'
    ];
    const isComercial = imovel.tipo_imovel === 'Sala Comercial' || imovel.tipo_imovel === 'Prédio Comercial';

    const entriesToShow = Object.entries(imovel).filter(([key, value]) => {
        if (commercialFields.includes(key)) return isComercial;
        return true;
    });

    return (
        <>
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-gray-300">
                    {entriesToShow.map(([key, value]) => (
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

// --- FORMULÁRIO DE IMÓVEL COM TODOS OS LABELS CORRIGIDOS ---
function ImovelForm({ imovelData, onSuccess, onClose }) {
    const [formData, setFormData] = useState(imovelData || {
        tipo_imovel: 'Apartamento', status_imovel: 'Disponível', endereco: '', descricao: '',
        valor_aluguel: '', valor_venda: '', area_util: '', area_total: '', andar: '',
        numero_quartos: '', numero_banheiros: '', vagas_garagem: '', condominio_valor: '', iptu_valor: '',
        codigo_energia: '', codigo_agua: '', administradora_condominio: '', data_aquisicao: '',
        data_venda: '', valor_aquisicao: '', imposto_venda: '', valor_liquido_venda: '',
        valor_liquido_aluguel: '', tipo_garantia: 'Caução', seguro_vencimento: '', seguro_corretora: '',
        seguro_seguradora: '', seguro_valor: '', imagens: '',
        avcb_codigo: '', avcb_emissao: '', avcb_vencimento: '', vencimento_extintores: '',
        vencimento_dedetizacao: '', vencimento_caixa_dagua: ''
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

    const isComercial = formData.tipo_imovel === 'Sala Comercial' || formData.tipo_imovel === 'Prédio Comercial';

    return (
        <form onSubmit={handleSubmit} id="modal-form" className="flex flex-col h-full overflow-hidden">
            <div className="p-8 flex-grow overflow-y-auto" id="modal-body">
                {/* --- SEÇÃO: DADOS PRINCIPAIS --- */}
                <h4 className="text-lg font-semibold text-orange-400 mb-4 border-b border-gray-700 pb-2">Dados Principais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="text-sm text-gray-400">Tipo de Imóvel</label>
                        <select name="tipo_imovel" value={formData.tipo_imovel || 'Apartamento'} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white">
                            <option value="Apartamento">Apartamento</option>
                            <option value="Casa">Casa</option>
                            <option value="Sala Comercial">Sala Comercial</option>
                            <option value="Prédio Comercial">Prédio Comercial</option>
                            <option value="Terreno">Terreno</option>
                            <option value="Galpão">Galpão</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Status</label>
                        <select name="status_imovel" value={formData.status_imovel || 'Disponível'} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white">
                            <option value="Disponível">Disponível</option>
                            <option value="Alugado">Alugado</option>
                            <option value="Vendido">Vendido</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Endereço Completo</label>
                        <input type="text" name="endereco" value={formData.endereco || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Descrição</label>
                        <textarea name="descricao" value={formData.descricao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" rows="3"></textarea>
                    </div>
                </div>

                {/* --- SEÇÃO: CARACTERÍSTICAS E VALORES --- */}
                <h4 className="text-lg font-semibold text-orange-400 mb-4 border-b border-gray-700 pb-2">Características e Valores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div><label className="text-sm text-gray-400">Área Útil (m²)</label><input type="number" name="area_util" value={formData.area_util || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required /></div>
                    <div><label className="text-sm text-gray-400">Área Total (m²)</label><input type="number" name="area_total" value={formData.area_total || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Nº de Quartos</label><input type="number" name="numero_quartos" value={formData.numero_quartos || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Nº de Banheiros</label><input type="number" name="numero_banheiros" value={formData.numero_banheiros || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Vagas de Garagem</label><input type="number" name="vagas_garagem" value={formData.vagas_garagem || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Nº Andares</label><input type="number" name="andar" value={formData.andar || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Valor do Aluguel</label><input type="number" name="valor_aluguel" value={formData.valor_aluguel || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" required step="0.01" /></div>
                    <div><label className="text-sm text-gray-400">Valor Líquido do Aluguel</label><input type="number" name="valor_liquido_aluguel" value={formData.valor_liquido_aluguel || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                    <div><label className="text-sm text-gray-400">Valor de Venda</label><input type="number" name="valor_venda" value={formData.valor_venda || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                    <div><label className="text-sm text-gray-400">Valor do Condomínio</label><input type="number" name="condominio_valor" value={formData.condominio_valor || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                    <div><label className="text-sm text-gray-400">Valor do IPTU</label><input type="number" name="iptu_valor" value={formData.iptu_valor || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                </div>

                {/* --- SEÇÃO: DADOS ADMINISTRATIVOS --- */}
                <h4 className="text-lg font-semibold text-orange-400 mb-4 border-b border-gray-700 pb-2">Dados Administrativos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div><label className="text-sm text-gray-400">Código de Energia</label><input type="text" name="codigo_energia" value={formData.codigo_energia || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Código de Água</label><input type="text" name="codigo_agua" value={formData.codigo_agua || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div className="md:col-span-2"><label className="text-sm text-gray-400">Administradora do Condomínio</label><input type="text" name="administradora_condominio" value={formData.administradora_condominio || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Data de Aquisição</label><input type="date" name="data_aquisicao" value={formData.data_aquisicao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Valor de Aquisição</label><input type="number" name="valor_aquisicao" value={formData.valor_aquisicao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                    <div><label className="text-sm text-gray-400">Data da Venda</label><input type="date" name="data_venda" value={formData.data_venda || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Imposto sobre Venda</label><input type="number" name="imposto_venda" value={formData.imposto_venda || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                    <div className="md:col-span-2"><label className="text-sm text-gray-400">Valor Líquido da Venda</label><input type="number" name="valor_liquido_venda" value={formData.valor_liquido_venda || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                </div>
                
                {/* --- SEÇÃO: SEGURO DO IMÓVEL --- */}
                <h4 className="text-lg font-semibold text-orange-400 mb-4 border-b border-gray-700 pb-2">Seguro do Imóvel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div><label className="text-sm text-gray-400">Seguradora</label><input type="text" name="seguro_seguradora" value={formData.seguro_seguradora || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Corretora</label><input type="text" name="seguro_corretora" value={formData.seguro_corretora || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Vencimento do Seguro</label><input type="date" name="seguro_vencimento" value={formData.seguro_vencimento || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                    <div><label className="text-sm text-gray-400">Valor do Seguro</label><input type="number" name="seguro_valor" value={formData.seguro_valor || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" step="0.01" /></div>
                </div>

                {/* --- SEÇÃO CONDICIONAL PARA IMÓVEIS COMERCIAIS --- */}
                {isComercial && (
                    <>
                        <div className="mt-2 pt-6 border-t border-gray-600">
                            <h4 className="text-lg font-semibold text-orange-400 mb-4">Certificados Comerciais</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="text-sm text-gray-400">Código AVCB</label><input type="text" name="avcb_codigo" value={formData.avcb_codigo || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                            <div><label className="text-sm text-gray-400">Emissão AVCB</label><input type="date" name="avcb_emissao" value={formData.avcb_emissao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                            <div><label className="text-sm text-gray-400">Vencimento AVCB</label><input type="date" name="avcb_vencimento" value={formData.avcb_vencimento || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                            <div><label className="text-sm text-gray-400">Vencimento Extintores</label><input type="date" name="vencimento_extintores" value={formData.vencimento_extintores || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                            <div><label className="text-sm text-gray-400">Vencimento Dedetização</label><input type="date" name="vencimento_dedetizacao" value={formData.vencimento_dedetizacao || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                            <div><label className="text-sm text-gray-400">Venc. Cert. Caixa d'Água</label><input type="date" name="vencimento_caixa_dagua" value={formData.vencimento_caixa_dagua || ''} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-600 rounded bg-gray-700 text-white" /></div>
                        </div>
                    </>
                )}

                {formError && <div className="text-red-400 mt-4 text-center">{formError}</div>}
            </div>
            <div className="flex-shrink-0 p-6 border-t border-gray-700 text-right">
                <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 ml-2">Salvar</button>
            </div>
        </form>
    );
}