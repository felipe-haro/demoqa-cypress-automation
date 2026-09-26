import BasePage from './BasePage';
import Modal from './components/Modal';

class ModalDialogsPage extends BasePage {
  constructor() {
    super({ path: '/modal-dialogs', title: 'Modal Dialogs' });

    this.modal = new Modal();
    this.variants = {
      small: { open: '#showSmallModal', close: '#closeSmallModal', title: 'Small Modal' },
      large: { open: '#showLargeModal', close: '#closeLargeModal', title: 'Large Modal' },
    };
  }

  open(size) {
    cy.get(this.variants[size].open).click();
    this.modal.shouldBeOpen(this.variants[size].title);
    return this;
  }

  closeWithButton(size) {
    cy.get(this.variants[size].close).click();
    return this;
  }
}

export default new ModalDialogsPage();
