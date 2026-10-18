async page => {
 const assert=(ok,message)=>{if(!ok)throw Error(message);};
 await page.goto('http://127.0.0.1:5174/');
 await page.locator('.sf-card').first().waitFor();
 const id=await page.locator('[data-product-id]').first().getAttribute('data-product-id');
 await page.locator('[data-product-id]').first().click();
 await page.locator('dialog[open]').waitFor();
 await page.evaluate(async id=>{await fetch('https://rj-test.invalid/rest/v1/rj_products?id=eq.'+id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({price_cents:8765,description:'Descrição atualizada em outra aba'})});window.dispatchEvent(new Event('focus'));},id);
 await page.waitForFunction(()=>document.querySelector('.rj-product__price')?.textContent.includes('87,65'));
 assert((await page.locator('.rj-product').textContent()).includes('Descrição atualizada em outra aba'),'Detalhes devem usar os dados mais recentes');
 await page.evaluate(async id=>{await fetch('https://rj-test.invalid/rest/v1/rj_products?id=eq.'+id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({status:'draft'})});window.dispatchEvent(new Event('focus'));},id);
 await page.locator('dialog[open]').waitFor({state:'hidden'});
 assert(await page.locator(`[data-product-id="${id}"]`).count()===0,'Produto despublicado deve sair do catálogo e fechar detalhes');
 await page.locator('.sf-announcements__item.is-active').filter({hasText:'Caixas sob medida para seu negócio'}).waitFor({timeout:10000});
 assert(await page.locator('.sf-announcements__item.is-active').textContent()==='Caixas sob medida para seu negócio','Segundo aviso precisa ser alcançável');
 return {result:'PASS',checks:['modal atualizado ao voltar à aba','modal fecha ao despublicar','aviso superior 2 aparece']};
}
