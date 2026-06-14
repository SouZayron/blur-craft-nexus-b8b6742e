const EstouraBalao = ({ admin = false }: { admin?: boolean }) => (
  <iframe
    title={admin ? "Admin Estoura Balão" : "Estoura Balão"}
    src={admin ? "/estourabalaao.html?admin=1" : "/estourabalaao.html"}
    style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
  />
);

export default EstouraBalao;
