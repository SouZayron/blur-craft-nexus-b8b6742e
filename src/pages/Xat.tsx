import { Helmet } from "react-helmet-async";

const Xat = () => {
  return (
    <>
      <Helmet>
        <title>AltaVibe Chat | ZGames</title>
        <meta name="description" content="Entre no chat da Rádio Alta Vibe diretamente no ZGames." />
      </Helmet>

      <div className="fixed inset-0 z-0 bg-background">
        <iframe
          src="https://xat.com/embed/chat.php#id=220535750&gn=AltaVibe"
          allow="clipboard-write"
          scrolling="no"
          title="Chat AltaVibe no xat"
          className="w-full h-full border-0 block"
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </div>
    </>
  );
};

export default Xat;
