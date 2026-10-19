# Como cuidar da loja RJ Caixas

Abra `/admin` e entre com o email e a senha recebidos da pessoa responsável pelo site. Se aparecer “Seu painel está quase pronto”, essa pessoa precisa concluir a ativação antes de você começar.

## Adicionar um produto

1. Em **Produtos**, toque em **Adicionar produto**.
2. Preencha nome, descrição e preço. Use vírgula para os centavos: `31,50`. Se deixar o preço vazio, a loja mostra “Sob consulta”.
3. Em **Pacote / quantidade**, explique a quantidade incluída nesse preço.
4. Toque em **Escolher imagem** para selecionar uma foto do celular ou computador. Aceitamos PNG, JPEG e WebP de até 5 MB.
5. Confira a prévia. Ela mostra o que você está preenchendo; a alteração só é aplicada ao salvar.
6. Escolha **Rascunho** para guardar e continuar depois, ou **Publicado** para mostrar na loja.
7. Toque em **Salvar alterações**. Aguarde a mensagem de confirmação e use **Abrir loja** para conferir.

## Alterar preços e informações

Busque o produto pelo nome e toque em **Editar**. A busca também funciona sem acentos. Altere os campos e salve.

Em **Mais detalhes**, você encontra preço anterior, texto por unidade, condição comercial, selo e ordem. O texto por unidade e a condição comercial precisam ser revisados manualmente quando o preço muda.

## Tirar um produto da loja

Para ocultar sem apagar, edite, escolha **Rascunho** e salve. Para manter o produto visível mas sem aceitar orçamento, desmarque **Disponível para orçamento**.

**Excluir** remove o cadastro após sua confirmação. Você pode cancelar a ação. A foto enviada permanece armazenada para não afetar outros cadastros que a utilizem.

## Trocar contato, WhatsApp e textos

Em **Configurações**, escolha o assunto:

- **Empresa e contato:** nome, logo, telefone, endereço e rodapé.
- **WhatsApp e redes:** link de atendimento, mensagem e redes sociais.
- **Página inicial:** avisos, títulos e vantagens da loja.
- **Informações da loja:** quem somos, entrega, dúvidas e demais orientações.

Você pode trocar de grupo sem perder os campos preenchidos. **Salvar configurações** grava as alterações de todos os grupos.

## Organizar imagens e categorias

**Categorias** organiza os grupos do catálogo. **Banners** controla as imagens de destaque da página inicial. Ao editar um banner, você pode escolher uma imagem para computador, outra para celular e o destino do clique.

## Ligar o Google e a Meta (Rastreamento)

Em **Rastreamento → Integrações**, informe o ID de cada ferramenta. Você também pode usar **Colar código de instalação → Identificar e preencher** para importar os IDs de um trecho oficial. Confira os valores e clique em **Salvar rastreamento**:

- **Google Tag Manager:** começa com `GTM-`.
- **Google Analytics 4:** começa com `G-`.
- **Google Ads:** começa com `AW-`.
- **Pixel da Meta:** só números (15 ou 16).

Deixe vazio o que não usa. O botão **Ativado/Pausado** permite desligar uma integração sem apagar seu ID. Use o ID numérico do Pixel, nunca o token privado da API de Conversões. Se configurar a mesma ferramenta no GTM e diretamente no painel, pode duplicar eventos. No GTM, prefira os modelos oficiais e configure o consentimento de cada tag; scripts inline na página principal continuam bloqueados.

No Google Ads, o campo **Rótulo da conversão de WhatsApp** recebe o trecho depois da barra: em `AW-123456789/AbC_deF`, informe `AbC_deF`. Sem rótulo, a tag carrega, mas essa conversão não é enviada. Cliques nos botões de WhatsApp enviam `Contact` à Meta e `whatsapp_click` ao Analytics/GTM conforme as integrações e o consentimento. O clique não comprova envio de mensagem ou venda.

Em **HTML personalizado**, adicione um nome, o código e a categoria **Análise** ou **Marketing**. Você pode pausar, editar e remover cada código; são aceitos até 10, com 12.000 caracteres cada. Eles executam em uma área isolada após consentimento, sem acesso aos cookies, conteúdo ou sessão da página principal. Ferramentas que precisam desse acesso devem usar a integração oficial ou GTM. Esses códigos são públicos: nunca inclua senhas ou tokens privados. Salve após qualquer alteração.

**Verificar configuração** confere os formatos dos campos; o estado **Configurado** indica preenchimento e não confirma recebimento dos eventos. A aba **Como testar** explica a conferência nas plataformas.

A loja mostra um aviso de cookies e as ferramentas só funcionam para quem aceitar. Para conferir, abra a loja em uma janela anônima, aceite os cookies e use o Tag Assistant (Google) ou o Meta Pixel Helper. Lembre-se de mencionar o uso de cookies na **Política de privacidade**, em Configurações → Informações da loja.

## Se algo der errado

Leia o aviso e corrija o campo indicado. Uma falha ao salvar mantém os dados digitados no formulário. Se outra pessoa tiver alterado o mesmo cadastro, anote suas mudanças antes de atualizar a lista e conferir a versão atual.

Antes de sair, salve ou escolha descartar suas alterações. Ao terminar em um computador compartilhado, use **Sair da conta**.
