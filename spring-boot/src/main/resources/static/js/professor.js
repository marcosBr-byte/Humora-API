const sessaoAdminFect = JSON.parse(sessionStorage.getItem('usuarioLogado'));

function sairAdminFect() {
    api.logout();
    window.location.replace('login.html');
}

if (sessaoAdminFect?.tipo === 'professor' && sessionStorage.getItem('token')) {
    document.querySelector('.fect-admin-conteudo').hidden = false;
    document.getElementById('sairAdmin').addEventListener('click', sairAdminFect);
    montarPainelFectProfessor(sairAdminFect);
} else {
    sairAdminFect();
}
