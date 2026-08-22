# Padronizar todas as páginas com a identidade ZGames

## Objetivo
Aplicar em todas as rotas frontend o mesmo visual gamer escuro, glassmorphism e neon da nova home, sem alterar regras, dados, integrações ou mecânicas dos jogos e ferramentas. Remover a identidade visual e textual Labxat e substituir por ZGames.

## Implementação

### 1. Base visual compartilhada
- Consolidar no tema global os tokens ZGames: fundo escuro, superfícies de vidro, bordas discretas, roxo/ciano, tipografia e sombras neon.
- Renomear os tokens legados `labxat-*` para tokens `zgames-*` e atualizar seus usos no frontend.
- Criar utilitários compartilhados para página, painel, cabeçalho, títulos e cartões, reduzindo diferenças entre telas.

### 2. Navegação e componentes globais
- Reformular o cabeçalho e rodapé compartilhados com a marca textual ZGames e o padrão visual da home.
- Atualizar componentes recorrentes, como cartões de vidro, seletores flutuantes, rádio e consentimento, para o mesmo acabamento visual.
- Preservar navegação, acessibilidade, responsividade e ações existentes.

### 3. Jogos e painéis administrativos
- Aplicar o tema ZGames em `/games`, `/control`, `/altavibe`, `/adminaltavibe`, `/machine`, `/adminmachine`, `/bingo-games` e `/Painel`.
- Padronizar fundos, abas, blocos, formulários, estados, tabelas, roletas e painéis com vidro escuro e destaques roxo/ciano.
- Não modificar sorteios, limites, realtime, autenticação atual, cadastros, resultados ou qualquer regra de jogo.

### 4. Ferramentas, bingo e páginas institucionais
- Atualizar `/cores`, `/nicks`, `/bingo`, `/emojis`, `/avatar-editor`, `/cartelas` e visualizações de cartelas.
- Atualizar `/sobre`, `/blog`, posts, `/privacidade`, `/termos` e página não encontrada.
- Manter conteúdos, dados e funcionalidades; alterar apenas apresentação e marca.

### 5. Identidade e metadados
- Trocar ocorrências visíveis de Labxat por ZGames em títulos, textos, nomes de arquivos baixados e metadados das rotas.
- Atualizar favicon, canonical e referências estruturadas antigas somente quando forem parte da identidade pública.
- Manter URLs externas e integrações necessárias ao funcionamento dos jogos.

### 6. Validação
- Verificar que não restaram referências públicas a Labxat no frontend.
- Rodar os testes disponíveis e validar as principais rotas em desktop e mobile, incluindo login, abas e estados essenciais sem escrever ou apagar dados.
- Conferir ausência de erros no console e problemas de sobreposição ou rolagem indevida.

## Detalhes técnicos
- Mudanças concentradas em CSS/tokens e componentes compartilhados, com ajustes locais somente onde cada página usa estilos próprios.
- Cores dinâmicas necessárias às roletas, previews de paleta e conteúdos gerados permanecem intactas porque fazem parte da mecânica/resultado, não da identidade visual.
- A rota `/xat` continuará em tela cheia; apenas seus metadados públicos serão atualizados para ZGames.
