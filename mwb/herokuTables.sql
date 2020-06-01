
-- -----------------------------------------------------
-- Table `proizvodjaci`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `proizvodjaci` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `naziv` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `kategorije`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kategorije` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `naziv` VARCHAR(45) NULL,
  `nadkategorija` INT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `nadkategorija_fk`
    FOREIGN KEY (`nadkategorija`)
    REFERENCES `kategorije` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `nadkategorija_fk_index` ON `kategorije` (`id` ASC, `nadkategorija` ASC) ;


-- -----------------------------------------------------
-- Table `proizvodi`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `proizvodi` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `naziv` VARCHAR(45) NULL,
  `proizvodjac` INT UNSIGNED NULL,
  `kategorija` INT UNSIGNED NULL,
  `cijena` DECIMAL NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `proiz_kat_fk`
    FOREIGN KEY (`kategorija`)
    REFERENCES `kategorije` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `proiz_man_fk`
    FOREIGN KEY (`proizvodjac`)
    REFERENCES `proizvodjaci` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `proiz_kat_fk_idx` ON `proizvodi` (`kategorija` ASC) ;

CREATE INDEX `proiz_man_fk_idx` ON `proizvodi` (`proizvodjac` ASC) ;


-- -----------------------------------------------------
-- Table `dobavljaci`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dobavljaci` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `naziv` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `proizvodi_dobavljaca`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `proizvodi_dobavljaca` (
  `proizvod_id` INT UNSIGNED NOT NULL,
  `dobavljac_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`proizvod_id`, `dobavljac_id`),
  CONSTRAINT `pd_dobavljac_fk`
    FOREIGN KEY (`dobavljac_id`)
    REFERENCES `dobavljaci` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `pd_proizvod_fk`
    FOREIGN KEY (`proizvod_id`)
    REFERENCES `proizvodi` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `pd_dobacljac_fk_idx` ON `proizvodi_dobavljaca` (`dobavljac_id` ASC) ;


-- -----------------------------------------------------
-- Table `skladista`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `skladista` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `naziv` VARCHAR(45) NULL,
  `naziv_lokacije` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;



-- -----------------------------------------------------
-- Table `proizvodi_skladista`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `proizvodi_skladista` (
  `proizvod_id` INT UNSIGNED NOT NULL,
  `skladiste_id` INT UNSIGNED NOT NULL,
  `kolicina` INT UNSIGNED NULL,
  PRIMARY KEY (`proizvod_id`, `skladiste_id`),
  CONSTRAINT `proiz_sklad_fk`
    FOREIGN KEY (`skladiste_id`)
    REFERENCES `skladista` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `sklad_proiz_fk`
    FOREIGN KEY (`proizvod_id`)
    REFERENCES `proizvodi` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `proiz_sklad_fk_idx` ON `proizvodi_skladista` (`skladiste_id` ASC) ;


-- -----------------------------------------------------
-- Table `osobe`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `osobe` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Ime` VARCHAR(45) NULL,
  `Prezime` VARCHAR(45) NULL,
  `Telefon` VARCHAR(45) NULL,
  `datum_zaposljavanja` DATE NULL,
  `JMBG` VARCHAR(45) NOT NULL,
  `naziv_lokacije` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

CREATE UNIQUE INDEX `JMBG_UNIQUE` ON `osobe` (`JMBG` ASC) ;



-- -----------------------------------------------------
-- Table `prava_pristupa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `prava_pristupa` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `naziv` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `korisnicki_racuni`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `korisnicki_racuni` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `osoba_id` INT UNSIGNED NULL,
  `pravo_pristupa` INT UNSIGNED NOT NULL,
  `password` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `racun_pristup_fk`
    FOREIGN KEY (`pravo_pristupa`)
    REFERENCES `prava_pristupa` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `racun_osoba_fk`
    FOREIGN KEY (`osoba_id`)
    REFERENCES `osobe` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE UNIQUE INDEX `EMAIL_UNIQUE` ON `korisnicki_racuni` (`email` ASC) ;

CREATE UNIQUE INDEX `osoba_id_UNIQUE` ON `korisnicki_racuni` (`osoba_id` ASC) ;

CREATE INDEX `racun_pristup_fk_idx` ON `korisnicki_racuni` (`pravo_pristupa` ASC) ;


-- -----------------------------------------------------
-- Table `stanja_kupovine`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `stanja_kupovine` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `stanje` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `kupovine`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kupovine` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `korisnicki_racun` INT UNSIGNED NULL,
  `stanje_id` INT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `kupovina_racun_fk`
    FOREIGN KEY (`korisnicki_racun`)
    REFERENCES `korisnicki_racuni` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `kupovina_stanje_fk`
    FOREIGN KEY (`stanje_id`)
    REFERENCES `stanja_kupovine` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `kupovina_racun_fk_idx` ON `kupovine` (`korisnicki_racun` ASC) ;

CREATE INDEX `kupovina_stanje_fk_idx` ON `kupovine` (`stanje_id` ASC) ;


-- -----------------------------------------------------
-- Table `proizvodi_kupovine`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `proizvodi_kupovine` (
  `proizvod_id` INT UNSIGNED NOT NULL,
  `kupovina_id` INT UNSIGNED NOT NULL,
  `kolicina` INT NULL,
  PRIMARY KEY (`proizvod_id`, `kupovina_id`),
  CONSTRAINT `kup_pro_fk`
    FOREIGN KEY (`proizvod_id`)
    REFERENCES `proizvodi` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `pro_kup_fk`
    FOREIGN KEY (`kupovina_id`)
    REFERENCES `kupovine` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `pro_kup_fk_idx` ON `proizvodi_kupovine` (`kupovina_id` ASC) ;


-- -----------------------------------------------------
-- Table `narudzbe`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `narudzbe` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `korisnicki_racun` INT UNSIGNED NOT NULL,
  `skladiste_id` INT UNSIGNED NOT NULL,
  `datum_kreiranja` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `datum_isporuke` DATE NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `narudzbe_racun_fk`
    FOREIGN KEY (`korisnicki_racun`)
    REFERENCES `korisnicki_racuni` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `narudzbe_skladiste_fk`
    FOREIGN KEY (`skladiste_id`)
    REFERENCES `skladista` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `narudzbe_racun_idx` ON `narudzbe` (`korisnicki_racun` ASC) ;

CREATE INDEX `narudzbe_skladiste_fk_idx` ON `narudzbe` (`skladiste_id` ASC) ;


-- -----------------------------------------------------
-- Table `artikli_narudzbe`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `artikli_narudzbe` (
  `dobavljac_id` INT UNSIGNED NOT NULL,
  `proizvod_id` INT UNSIGNED NOT NULL,
  `narudzba_id` INT UNSIGNED NOT NULL,
  `kolicina` INT NULL,
  PRIMARY KEY (`narudzba_id`, `proizvod_id`, `dobavljac_id`),
  CONSTRAINT `art_pd_fk`
    FOREIGN KEY (`dobavljac_id` , `proizvod_id`)
    REFERENCES `proizvodi_dobavljaca` (`dobavljac_id` , `proizvod_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `art_nar_fk`
    FOREIGN KEY (`narudzba_id`)
    REFERENCES `narudzbe` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `art_pd_fk_idx` ON `artikli_narudzbe` (`dobavljac_id` ASC, `proizvod_id` ASC) ;

CREATE INDEX `art_nar_fk_idx` ON `artikli_narudzbe` (`narudzba_id` ASC) ;


INSERT INTO prava_pristupa(id, naziv) VALUES (1, "ADMIN");
INSERT INTO prava_pristupa(id, naziv) VALUES (2, "UPOSLENIK");
INSERT INTO prava_pristupa(id, naziv) VALUES (3, "KUPAC");


INSERT INTO osobe(Ime, Prezime, Telefon, datum_zaposljavanja, JMBG, naziv_lokacije)
VALUES ("Admin", "Admin", "(+387)61/123-456", now(), "2101999175009", "Sarajevo, Safvet-bega Basagica 33");

INSERT INTO korisnicki_racuni(osoba_id, pravo_pristupa, password, email)
VALUES (
	1,
	1,
	"$2b$10$bXtk.6HbvmPfNXA5HMeJXeK//J2MjWcBGbioO6bjw.NWO2WQErflm",
	"admin@admin.com"
	);

INSERT INTO stanja_kupovine(stanje) VALUES("kreirana");
INSERT INTO stanja_kupovine(stanje) VALUES("primljena");
INSERT INTO stanja_kupovine(stanje) VALUES("u obradi");
INSERT INTO stanja_kupovine(stanje) VALUES("otpremljena");
INSERT INTO stanja_kupovine(stanje) VALUES("blokirana");
INSERT INTO stanja_kupovine(stanje) VALUES("odbijena");
INSERT INTO stanja_kupovine(stanje) VALUES("obrisana");

INSERT INTO proizvodjaci(1,"Proizvodjac1")
INSERT INTO proizvodjaci(2,"proizvodjac2")
INSERT INTO kategorije VALUES(1,"kat1",null)
INSERT INTO kategorije VALUES(2,"kat2",null)
INSERT INTO kategorije VALUES(3,"kat3",1)
ALTER TABLE proizvodi_skladista ADD status TEXT NOT NULL
ALTER TABLE proizvodi ADD cijena INT NOT NULL
INSERT INTO proizvodi VALUES(1,"proizvod1",1,2,50);
INSERT INTO proizvodi VALUES(2,"proizvod2",1,1,100);
INSERT INTO proizvodi VALUES(3,"proizvod3",2,3,20);
INSERT INTO proizvodi VALUES(4,"proizvod4",1,1,80);
INSERT INTO proizvodi VALUES(5,"proizvod5",2,1,120);