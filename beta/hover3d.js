document.querySelectorAll('.linkbox-anchor').forEach(link => {
  link.addEventListener('mousemove', e => {
    const rect = link.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 10;
    const rotateX = -((y - centerY) / centerY) * 10;
    
    link.style.setProperty('--rotateX', `${rotateX}deg`);
    link.style.setProperty('--rotateY', `${rotateY}deg`);
  });
  
  link.addEventListener('mouseleave', () => {
    link.style.setProperty('--rotateX', '0deg');
    link.style.setProperty('--rotateY', '0deg');
  });
});

document.querySelectorAll('.icon-wrapper').forEach(wrapper => {
    wrapper.addEventListener('mousemove', e => {
        const box = wrapper.getBoundingClientRect();
        const mouseX = e.clientX - box.left;
        const mouseY = e.clientY - box.top;
        
        const rotateY = ((mouseX - box.width / 2) / (box.width / 2)) * 15;
        const rotateX = ((mouseY - box.height / 2) / (box.height / 2)) * -15;
        
        wrapper.style.setProperty('--rotateX', `${rotateX}deg`);
        wrapper.style.setProperty('--rotateY', `${rotateY}deg`);
    });
    
    wrapper.addEventListener('mouseleave', () => {
        wrapper.style.setProperty('--rotateX', '0deg');
        wrapper.style.setProperty('--rotateY', '0deg');
    });
});
