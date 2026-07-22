const CIDADES = {
    
<option value="bnu">Brunópolis</option>
<option value="cnv">Campos Novos</option>
<option value="ctb">Curitibanos</option>
<option value="fbg">Fraiburgo</option>
<option value="frr">Frei Rogério</option>
<option value="iom">Iomerê</option>
<option value="mca">Monte Carlo</option>
<option value="ppr">Pinheiro Preto</option>
<option value="vda">Videira</option>
<option value="agr">Agronômica</option>
<option value="aur">Aurora</option>
<option value="itu">Ituporanga</option>
<option value="lon">Lontras</option>
<option value="ptl">Petrolândia</option>
<option value="prd">Pouso Redondo</option>
<option value="rsl">Rio do Sul</option>
<option value="cbs">Campo Belo do Sul</option>
<option value="cat">Capão Alto</option>
<option value="cpo">Correia Pinto</option>
<option value="lgs">Lages</option>
<option value="pta">Ponte Alta</option>
<option value="api">Apiúna</option>
<option value="asc">Ascurra</option>
<option value="blu">Blumenau</option>
<option value="idl">Indaial</option>
<option value="rod">Rodeio</option>
<option value="ace">Água Doce</option>
<option value="ctv">Catanduvas</option>
<option value="hdo">Herval d'Oeste</option>
<option value="ibc">Ibicaré</option>
<option value="ipi">Ipira</option>
<option value="jba">Joaçaba</option>
<option value="lzn">Luzerna</option>
<option value="ptb">Piratuba</option>
<option value="svs">Salto Veloso</option>
<option value="tan">Tangará</option>
<option value="tzs">Treze Tílias</option>
<option value="ant">Anita Garibaldi</option>
<option value="cdr">Caçador</option>
<option value="mra">Macieira</option>
<option value="pan">Ponte Alta do Norte</option>
<option value="sct">São Cristóvão do Sul</option>
<option value="arq">Araquari</option>
<option value="bbs">Balneário Barra do Sul</option>
<option value="brq">Brusque</option>
<option value="cmb">Camboriú</option>
<option value="cal">Campo Alegre</option>
<option value="grm">Guaramirim</option>
<option value="jas">Jaraguá do Sul</option>
<option value="jve">Joinville</option>
<option value="las">Luiz Alves</option>
<option value="mas">Massaranduba</option>
<option value="sfs">São Francisco do Sul</option>
<option value="sch">Schroeder</option>
<option value="evv">Erval Velho</option>
<option value="ldp">Lacerdópolis</option>
<option value="rdc">Rio dos Cedros</option>
<option value="bpi">Balneário Piçarras</option>
<option value="bve">Barra Velha</option>
<option value="nav">Navegantes</option>
<option value="pen">Penha</option>
<option value="sji">São João do Itaperiú</option>
<option value="gva">Garuva</option>
<option value="itp">Itapoá</option>
  }
</select>

document.addEventListener('DOMContentLoaded', () => {
    const selectCidade = document.getElementById('cidade');

    for (const [nomeCidade, sigla] of Object.entries(CIDADES)) {
        const option = document.createElement('option');
        option.value = sigla;
        option.textContent = nomeCidade;
        selectCidade.appendChild(option);
    }
});
