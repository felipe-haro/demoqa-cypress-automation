import modalDialogs from '../../pages/ModalDialogsPage';

describe('Alerts - Modal dialogs', { tags: ['@alerts'] }, () => {
  beforeEach(() => {
    modalDialogs.visit();
  });

  it(
    'opens the small modal with its content and closes it with the Close button',
    { tags: ['@smoke', '@regression'] },
    () => {
      modalDialogs.open('small');

      modalDialogs.modal.body().should('have.text', 'This is a small modal. It has very less content');
      modalDialogs.closeWithButton('small');
      modalDialogs.modal.shouldBeClosed();
    },
  );

  it('opens the large modal and closes it with the header "X" icon', { tags: '@regression' }, () => {
    modalDialogs.open('large');

    modalDialogs.modal.root().find('.modal-dialog').should('have.class', 'modal-lg');
    modalDialogs.modal.body().invoke('text').should('have.length.greaterThan', 500);
    modalDialogs.modal.closeWithIcon().shouldBeClosed();
  });

  ['small', 'large'].forEach((size) => {
    it(`closes the ${size} modal when clicking outside it`, { tags: '@regression' }, () => {
      modalDialogs.open(size);

      modalDialogs.modal.closeWithBackdrop().shouldBeClosed();
    });
  });

  it('closes the modal with the Escape key', { tags: '@regression' }, () => {
    modalDialogs.open('small');

    modalDialogs.modal.closeWithEscape().shouldBeClosed();
  });

  it('re-opens a modal after it was closed', { tags: '@regression' }, () => {
    modalDialogs.open('small').closeWithButton('small');
    modalDialogs.modal.shouldBeClosed();

    modalDialogs.open('large');
  });
});
