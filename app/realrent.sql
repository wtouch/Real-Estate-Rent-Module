-- phpMyAdmin SQL Dump
-- version 4.0.4.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jun 07, 2015 at 03:48 PM
-- Server version: 5.6.11
-- PHP Version: 5.5.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `realrent`
--
CREATE DATABASE IF NOT EXISTS `realrent` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `realrent`;

DELIMITER $$
--
-- Functions
--
DROP FUNCTION IF EXISTS `GetFamilyTree`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `GetFamilyTree`(`GivenId` VARCHAR(50)) RETURNS varchar(1024) CHARSET latin1
    DETERMINISTIC
BEGIN

    DECLARE rv,q,queue,queue_children,queue_names VARCHAR(1024);
    DECLARE queue_length,pos INT;
    DECLARE GivenSSN,front_ssn VARCHAR(64);

    SET rv = '';

    SELECT id INTO GivenSSN
    FROM users
    WHERE id = GivenId;
    IF ISNULL(GivenSSN) THEN
        RETURN ev;
    END IF;

    SET queue = GivenSSN;
    SET queue_length = 1;

    WHILE queue_length > 0 DO
        IF queue_length = 1 THEN
            SET front_ssn = queue;
            SET queue = '';
        ELSE
            SET pos = LOCATE(',',queue);
            SET front_ssn = LEFT(queue,pos - 1);
            SET q = SUBSTR(queue,pos + 1);
            SET queue = q;
        END IF;
        SET queue_length = queue_length - 1;
        SELECT IFNULL(qc,'') INTO queue_children
        FROM
        (
            SELECT GROUP_CONCAT(id) qc FROM users
            WHERE user_id = front_ssn AND group_id <> '1'
        ) A;
        SELECT IFNULL(qc,'') INTO queue_names
        FROM
        (
            SELECT GROUP_CONCAT(id) qc FROM users
            WHERE user_id = front_ssn AND group_id <> '1'
        ) A;
        IF LENGTH(queue_children) = 0 THEN
            IF LENGTH(queue) = 0 THEN
                SET queue_length = 0;
            END IF;
        ELSE
            IF LENGTH(rv) = 0 THEN
                SET rv = queue_names;
            ELSE
                SET rv = CONCAT(rv,',',queue_names);
            END IF;
            IF LENGTH(queue) = 0 THEN
                SET queue = queue_children;
            ELSE
                SET queue = CONCAT(queue,',',queue_children);
            END IF;
            SET queue_length = LENGTH(queue) - LENGTH(REPLACE(queue,',','')) + 1;
        END IF;
    END WHILE;

    RETURN rv;

END$$

DROP FUNCTION IF EXISTS `getParentId`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `getParentId`(`userId` INT) RETURNS varchar(64) CHARSET latin1
    NO SQL
BEGIN
    DECLARE rv VARCHAR(50);
	DECLARE uid INT;
	DECLARE gid INT;
	
	SELECT IFNULL(user_id,-1) INTO uid FROM
    (SELECT user_id FROM users WHERE id = userId) A;

	

    SELECT IFNULL(id,-1) INTO rv FROM
    (SELECT g.id FROM `users` as u
left join users as g on g.id = u.user_id where u.id = userId) C;
    RETURN rv;



END$$

DROP FUNCTION IF EXISTS `getParentName`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `getParentName`(`userId` INT) RETURNS varchar(64) CHARSET latin1
    NO SQL
BEGIN
    DECLARE rv VARCHAR(50);
	DECLARE uid INT;
	DECLARE gid INT;
	
	SELECT IFNULL(user_id,-1) INTO uid FROM
    (SELECT user_id FROM users WHERE id = userId) A;

	

    SELECT IFNULL(name,NULL) INTO rv FROM
    (SELECT g.name FROM `users` as u
left join users as g on g.id = u.user_id where u.id = userId) C;
    RETURN rv;



END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
CREATE TABLE IF NOT EXISTS `account` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) NOT NULL,
  `account_name` varchar(256) NOT NULL,
  `category` varchar(256) NOT NULL,
  `account_no` varchar(256) NOT NULL,
  `description` varchar(256) NOT NULL,
  `date` date NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=40 ;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`id`, `user_id`, `account_name`, `category`, `account_no`, `description`, `date`, `status`) VALUES
(38, 1, 'HDFC', 'Bank', '5455', 'fgfgfg', '2015-06-04', '1'),
(39, 89, 'HDFC', 'Bank', '598554', 'jhsdfjk', '2015-06-07', '1');

-- --------------------------------------------------------

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
CREATE TABLE IF NOT EXISTS `config` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `config_name` varchar(256) NOT NULL,
  `config_data` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Dumping data for table `config`
--

INSERT INTO `config` (`id`, `config_name`, `config_data`) VALUES
(1, 'business', '{"ownership":["Sole Proprietory(Individual)","Partnership","Professional Association","Private Limited Company","Public Limited Company"],"additional_business":["Trader","Manufacturer","Retailer","Buying House","Wholesaler","Exporter","Service Provider"],"infrastructure":["Customization Facilities","Customized Packaging","Distribution Network","Infrastructural Set-Up","Infrastructural & Manufacturing Facilities","Infrastructure & Team","Infrastructure Facilities","Logistics","Logistics & Transportation","Logistics Facility & Timely Delivery","Manufacturing Facilities","Manufacturing Unit","Our Infrastructure","Our Machinery","Our Vendor Base","Our Warehouse","Packaging & Delivery","Packaging & Transportation","Product Packaging","Production Facility","Reasearch & Development","Reasearch & Development Activities","Reasearch & Development Facilities","Sales Network","Warehouse & Packaging","Warehouse Facilities","Warehouse Unit","Warehousing & Logistics","Warehousing & Packaging","Warehousing,Packaging & Logistics","Warehousing,Packaging & Timely Delivery","Warehousing,Packaging & Transportation","Wide Distribution Network"],"year":["2010","2011","2012","2013","2014","2015"],"employees":["10","20","30","50","100","500+","1000+"],"business_type":["Trader","Manufacturer","Retailer","Buying House","Wholesaler","Exporter","Service Provider"],"media_type":["Television","News Paper"]}'),
(2, 'manage_user', '{"group_access":{"admin":"Admin Group","salesman":"Salesman","manager":"Manager","customer":"Customer"},"user_module":{"user_list":"User List","add_user":"Add User","edit_user":"Edit User","ban_user":"Ban user","delete_user":"Delete User","reset_user_password":"Reset User Password","activate_user":"Activate User","assign_user_group":"Assign Group to User","add_group":"Add Group","edit_group":"Edit Group"},"template_module":{"template_list":"Template List","my_template":"My template List","request_custom_template":"Request Custom Template","add_template":"Add Template","edit_template":"Edit Template","delete_template":"Delete Template","Make_Private":"Make Private\\/Public Template","set_template_price":"Set Template Price","rate_template":"Rate to Template","filter_by_development_status":"Filter by development status","assign_to_developer":"assign to Developer","filter_by_developer":"Filter By Developer","publish_template":"Publish Template"},"business_module":{"business_list":"Business List","add_business":"Add Business","approve_business":"Approve Business","verify_business":"Verify Business","edit_business":"Edit Business","delete_business":"Delete Business","featured_business":"Featured Business","filter_by_customer":"filter by customer"},"product_module":{"product_list":"List of Products","reorder_products":"Re-order Products","edit_product":"Edit Product","add_product":"Add Product","featured_product":"Featured Product","delete_product":"Delete Product"},"dashboard":{"default_widgets":"Default Widgets","create_moddule_widget":"create Moddule Widget","create_statistics_widget":"Create Statistics Widget","manage_widgets":"Manage Widgets"},"enquiry_module":{"all_enquiries":"All Enquiries","filter_by_user":"Filter Enquiries by Customer","filter_by_category":"Filter By Category","filter_by_type":"Filter Enquiries by Type","search_enquiries":"Search Enquiries","Delete Mail":"Delete Mail"},"website_module":{"website_list":"Website List","manage_domain":"Manage Domain","customer_filter":"Customer Filter","validity_filter":"Validity Filter","expiry":"Set Expiry","change_settings":"Change Website Settings","renew":"Renew Website","request_site":"Request for New Website","requested_sites":"Requested Website List","edit_domain":"Edit Domain Name","publish_domain":"Publish\\/Active Domain","reject_domain":"Reject Domain Registration"},"config":{"config":"Group Config","config2":"Group Config2"}}'),
(3, 'template', '{"category":[{"name":"Jewellery","system_name":"jewellery"},{"name":"Arts & Culture","system_name":"arts_culture"},{"name":"Animals & Pets","system_name":"animals_pets"},{"name":"Design & Photography","system_name":"design_photography"},{"name":"Educational & Books","system_name":"educational_books"},{"name":"Medical (Healthcare)Products & Services","system_name":"medical_healthcare"},{"name":"Furniture Products","system_name":"furniture_products"},{"name":"Business & Services","system_name":"business_services"},{"name":"Computers & Internet","system_name":"computers_internet"},{"name":"Fashion & Beauty","system_name":"fashion_beauty"},{"name":"Electronics & Electrical","system_name":"electronics_electrical"},{"name":"Industrial Supplies","system_name":"industrial_supplies"},{"name":"Food & Restaurant","system_name":"food_restaurant"},{"name":"Cars & Motorcycles","system_name":"cars_motorcycles"},{"name":"Sports,Outdoors & Travel","system_name":"sports_outdoors_travel"},{"name":"Home & Family","system_name":"home_family"},{"name":"Entertainment, Games & Nightlife","system_name":"entertainment_games_nightlife"},{"name":"Holidays, Gifts & Flowers","system_name":"holidays_gifts_flowers"},{"name":"Society & Peoples","system_name":"society_peoples"},{"name":"Travel & Tourism","system_name":"travel_tourism"},{"name":"Real Estate","system_name":"real_estate"},{"name":"Small Businesses","system_name":"small_businesses"},{"name":"Building & Construction","system_name":"building_construction"},{"name":"Ayurvedic & Herbal Products","system_name":"ayurvedic_herbal_products"},{"name":"Event Management Services","system_name":"event_management_services"},{"name":"Railway, Shipping & Aviation","system_name":"railway_shipping_aviation"}],"development_status":[{"name":"Order Placed","system_name":"order_placed"},{"name":"Rejected","system_name":"Rejected"},{"name":"Inprogress","system_name":"inprogress"},{"name":"Completed","system_name":"completed"}]}'),
(4, 'property', '{"amenities" : ["Power Backup", "Water Storage", "Lift", "Reserve Parking", "Security", "Maintenance Staff", "GYM", "Park", "Private Terrace", "Swimming Pool", "Servant Quarters", "Club House"],\n			\n			"types" : [\n						{	"category_name" : "Residential Property",\n							"type" : "Flats & Apartment"\n						},\n						\n						{	"category_name" : "Residential Property",\n							 "type" :"Individual House/ Home"\n						},\n						\n						{   "category_name" : "Residential Property",\n							 "type" :"Society Housing"\n						},\n						\n						{	"category_name" : "Residential Property",\n							 "type" :  "Farm House"\n						},\n						\n						{	"category_name" : "Residential Property",\n							 "type" : "Builder Floor"\n						},\n						\n						{	"category_name" : "Residential Property",\n							 "type" : "Apartments"\n						},\n			\n						{	"category_name" : "Residential Property",\n							 "type" : "Residential Land/ Plot"\n						},\n			\n						{	"category_name" : "Residential Property",\n							 "type" : "Bunglaows/ Villas"\n						},\n						\n						{	"category_name" : "Residential Property",\n							 "type" :"Penthouses"\n						},					\n					\n						{	"category_name" : "Commercial Property",\n							"type" : "Commercial Shops"\n						},\n\n						{	"category_name" : "Commercial Property",\n							"type" : "Showrooms"\n						},\n						\n						{	"category_name" : "Commercial Property",\n							"type" : "Office Space"\n						},\n						\n						{	"category_name" : "Commercial Property",\n							"type" : "Office Complex"\n						},\n						\n						{	"category_name" : "Commercial Property",\n							"type" : "Banquet Hall & Guest House"\n						},\n						\n						{	"category_name" : "Commercial Property",\n							"type" : "Shopping Mall Space"\n						},\n						\n						{	"category_name" : "Commercial Property",\n							"type" : "Business Center"\n						},\n						\n						{	"category_name" : "Commercial Property",\n							"type" : "Commercial Lands & Plots"\n						},\n						\n						{	"category_name" : "Commercial Property",\n							"type" : "Hotel & Restaurant"\n						},\n						\n						{	"category_name" : "Commercial Property",\n							"type" : "Intitutional Land"\n						},				\n						\n						{	"category_name" : "Commercial Property",\n							"type" : "Clinic & Hospital Building"\n						},\n\n						{	"category_name" : "Agricultural Land",\n							"type" :"Farm Land"\n						},\n						\n						{	"category_name" : "Agricultural Land",\n							"type" :"Farm Land For Lease"\n						},	\n						\n						{	"category_name" : "Agricultural Land",\n							"type" :"Pasture"\n						},\n							\n						{	"category_name" : "Industrial Property",\n							"type" : "Industrial Land/Plot"\n						},\n\n						{	"category_name" : "Industrial Property",\n							"type" :  "Warehouse/Godown"\n						},\n						\n						{	"category_name" : "Industrial Property",\n							"type" :  "Factory"\n						},\n						\n						{	"category_name" : "Industrial Property",\n							"type" :  "Factory Plot/Land"\n					}],			\n			\n			"category" : [{\n				"category_name" : "Residential Property"				\n			},\n			{\n				"category_name" : "Commercial Property" 					\n			},\n			{\n				"category_name" : "Agricultural Land"					\n			},\n			{\n				"category_name" : "Industrial Property"				\n			}],	\n\n			"Bathrooms" :["0","1","2","3","4","5","6"],\n			\n			"Bedrooms" :["0","1","2","3","4","5","6"],\n			\n			"currency" : ["In-Rupees","Thousand","Lac","Carore"],\n			\n			"propertyAge" : ["under Construction", "New Construction", "0 to 5 years", "5 to 10 years", "10 to 15 years", "15 to 20 years", "Above 20 years"], \n			\n			"furnished" : ["Furnished", "Unfurnished", "Semi-Furnished"],\n			\n			"transaction_type" : ["Resale Property", "New Property"],\n			\n			"ownership" :["Individual", "Others","Broker/Agent","Builder/Promoter"],\n			\n			"floors" : ["0","1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],\n			\n			"facing" : ["East", "West", "South", "North" , "South East", "South West", "North West", "North East"],\n			\n			"property_floor" : ["Ground", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20" ],\n			\n			"parking" : ["No Parking","1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],\n			\n			"area_Details"	: ["Sq.Feet", "Cent", "Sq. Yards", "Ares", "Acre", "Sq. Meter","Bigha", "Hectares", "Guntha", "Marla"],\n			\n			"property_Price" : {\n				"Amount" : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],\n				"In_Rupees" : ["Thousand", "Lac", "Crore"]\n			}        \n		\n	}'),
(5, 'rentsetting', '{"service_tax":"12%","tds":"1%","other_tax":"1%"}'),
(6, 'category', '{"category":\n[{"name":"Licence Fees","system_name":"Licence Fees", "type" : "income"},\n{"name":"Agriculture","system_name":"Agriculture", "type" : "income"},\n{"name":"Commissions","system_name":"Commissions", "type" : "income"},\n{"name":"Fees & Charges","system_name":"Fees & Charges", "type" : "income"},\n{"name":"Investments","system_name":"Investments", "type" : "income"},\n{"name":"Non-Profit","system_name":"Non-Profit", "type" : "income"},\n{"name":"Other Income","system_name":"Other Income", "type" : "income"},\n{"name":"income","system_name":"income", "type" : "income"},\n{"name":"Professional Services","system_name":"Professional Services", "type" : "income"},\n{"name":"Sales Product & Services","system_name":"Sales Product & Services", "type" : "income"},\n{"name":"Agriculture","system_name":"Agriculture", "type" : "expense"},\n{"name":"Pets","system_name":"Pets", "type" : "expense"},\n{"name":"Building & Equipments","system_name":"Building & Equipments", "type" : "expense"},\n{"name":"Household","system_name":"Household", "type" : "expense"},\n{"name":"Computers/Communication","system_name":"Computers/Communication", "type" : "expense"},\n{"name":"Fees,Charges & Subscription","system_name":"Fees,Charges & Subscription", "type" : "expense"},\n{"name":"Insurance","system_name":"Insurance", "type" : "expense"},\n{"name":"Financial","system_name":"Financial", "type" : "expense"},\n{"name":"Non-Profit","system_name":"Non-Profit", "type" : "expense"},\n{"name":"Office","system_name":"Office", "type" : "expense"},\n{"name":"Other Expenses","system_name":"Other Expenses", "type" : "expense"},\n{"name":"Donation & Gifts","system_name":"Donation & Gifts", "type" : "expense"},\n{"name":"Other","system_name":"Other", "type" : "expense"},\n{"name":"Payroll","system_name":"Payroll", "type" : "expense"},\n{"name":"Services","system_name":"Services", "type" : "expense"},\n{"name":"Taxes","system_name":"Taxes", "type" : "expense"}]\n}');

-- --------------------------------------------------------

--
-- Table structure for table `enquiry`
--

DROP TABLE IF EXISTS `enquiry`;
CREATE TABLE IF NOT EXISTS `enquiry` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) NOT NULL,
  `name` varchar(256) NOT NULL,
  `from_email` varchar(256) NOT NULL,
  `to_email` varchar(256) NOT NULL,
  `subject` varchar(256) NOT NULL,
  `message` longtext NOT NULL,
  `date` datetime NOT NULL,
  `status` enum('0','1','2') NOT NULL DEFAULT '1',
  `read_status` enum('0','1') NOT NULL DEFAULT '0',
  `Attachment` varchar(256) NOT NULL,
  `reply_status` enum('1','0') NOT NULL DEFAULT '0',
  `reply_date` datetime NOT NULL,
  `reply_message` longtext NOT NULL,
  `response_for` varchar(256) NOT NULL,
  `domain` varchar(256) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=72 ;

--
-- Dumping data for table `enquiry`
--

INSERT INTO `enquiry` (`id`, `user_id`, `name`, `from_email`, `to_email`, `subject`, `message`, `date`, `status`, `read_status`, `Attachment`, `reply_status`, `reply_date`, `reply_message`, `response_for`, `domain`) VALUES
(1, 1, 'sonlu', '{"from":"admin@wtouch.in"}', '{"to":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"8546546446","address":"pune","message":"trial msg from front end enquiry form."}', '2015-03-31 13:37:30', '0', '1', '', '1', '2015-04-02 10:51:27', '{"subject":"RE: Website Enquiry","message":"<p>lkjdfksdfkl<\\/p>","from_email":"vilas@wtouch.in","name":"super admin","to_email":"admin@wtouch.in"}', '', ''),
(2, 1, 'sonlu', '{"from":"admin@wtouch.in"}', '{"to":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"8546546446","address":"pune","message":"trial msg from front end enquiry form."}', '2015-03-31 13:37:30', '0', '1', '', '1', '2015-03-31 14:25:14', '{"subject":"RE: Website Enquiry","message":"<p>thank you! we will contact you shortly!<\\/p>","from_email":"vilas@wtouch.in","name":"Vilas Shetkar","to_email":"admin@wtouch.in"}', '', ''),
(3, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilas@wtouch.in","cc":"vilasshetkar@gmail.com"}', 'compose mail trial from local!', '<p>trial msg!</p>', '2015-03-31 13:46:40', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(4, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilasshetkar@gmail.com"}', 'subject', '<p>lkfdjklasjkfljsd</p>', '2015-03-31 13:51:58', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(5, 1, 'vilasshetkar', '{"from":"vilasshetkar@gmail.com"}', '{"to":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"7465654564","address":"pune","message":"msg"}', '2015-03-31 13:58:37', '0', '1', '', '0', '0000-00-00 00:00:00', '', '', ''),
(6, 1, 'vilas shetkar', '{"from":"vilasshetkar@gmail.com"}', '{"to":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"8888888888","address":"pune","message":"website enquiry!"}', '2015-03-31 14:00:27', '1', '1', '', '1', '2015-04-04 17:15:02', '{"subject":"RE: Website Enquiry","message":"<p>gd dfhg fg<\\/p>","from_email":"vilas@wtouch.in","name":"super admin","to_email":"vilasshetkar@gmail.com"}', '', ''),
(7, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"admin@wtouch.in","cc":"vilasshetkar@gmail.com"}', 'trial msg subject!', '<p>trial msg body!</p>', '2015-03-31 13:51:58', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(8, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":"vilasshetkar@gmail.com"}', '{"to":"admin@wtouch.in"}', 'trial with cc mail', '<p>msg body</p>', '2015-03-31 14:07:19', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(9, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":"support@wtouch.in"}', '{"to":"vilasshetkar@gmail.com"}', 'with cc check', '<p>lkdsjflksdjflksdhlk</p>', '2015-03-31 14:16:07', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(10, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":"vilasshetkar@gmail.com"}', '{"to":"admin@wtouch.in"}', 'with cc check', '<p>lkfjdlkafhdsfk</p>', '2015-03-31 14:16:07', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(11, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilasshetkar@gmail.com","cc":"admin@wtouch.in"}', 'trial with cc', '<p>lfkjdslkfds</p>', '2015-03-31 14:21:18', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(12, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilas@wtouch.in","cc":"admin@wtouch.in"}', 'lfjdsl', '<p>lkdjflksdjflksd</p>\n<p>&nbsp;</p>', '2015-03-31 14:24:07', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(13, 3, 'vilasshetkar', '{"from":"dnyaneshwar@wtouch.in","cc":""}', '{"to":"admin@wtouch.in","cc":"vilasshetkar@gmail.com"}', 'trial with other login', '<p>dlsjflksd</p>', '2015-03-31 14:25:14', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(14, 1, 'dnyaneshwar', '{"from":"sonu@wtouch.in"}', '{"to":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"7641651646","address":"lksjdlfkjsd","message":"lkhfdskjfshdklfsdj"}', '2015-04-01 10:05:39', '0', '1', '', '1', '2015-04-01 10:06:14', '{"subject":"RE: Website Enquiry","message":"<p>sdfsdfsdf<\\/p>","from_email":"vilas@wtouch.in","name":"Vilas Shetkar","to_email":"sonu@wtouch.in"}', '', ''),
(15, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"trupti@wtouch.in","cc":"sunita@wtouch.in"}', 'trial mail from local small business', '<p>msg</p>', '2015-04-02 10:51:27', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(16, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"aarti@wtouch.in","cc":"pooja@wtouch.in"}', 'trialmail', '<p>welcome</p>', '2015-04-02 16:33:54', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(17, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"aarti@wtouch.in"}', 'invite for meeting', '<p>meeting at sharp 10.00AM</p>', '2015-04-02 16:35:39', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(18, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"aarti@wtouch.in","cc":"trupti@wtouch.in"}', 'welcome party', '<p>fddsfdf</p>', '2015-04-02 17:19:15', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(19, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"trupti@wtouch.in"}', 'solve the error', '<p>dsfsdfdsf</p>', '2015-04-02 17:21:37', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(20, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"trupti@wtouch.in","cc":""}', 'trial email', '<p>this is inform to u.</p>', '2015-04-04 17:38:44', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(21, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"trupti@wtouch.in","cc":""}', 'First Mail', '<p>This is inform to you,your Project viva is on13th .</p>', '2015-04-09 15:33:34', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(22, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilas@wtouch.in","cc":"trupti@wtouch.in"}', 'trial from local', '<p>lkjfdlkafjsd</p>', '2015-04-09 19:59:28', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(23, 8, 'Trupti', '{"from":"trupti@wtouch.in"}', '{"to":"aarti@wtouch.in"}', 'Website Enquiry', '{"phone":"9854745154","address":"Mumbai","message":"Trailmail"}', '2015-04-10 11:23:43', '1', '1', '', '0', '0000-00-00 00:00:00', '', '', ''),
(24, 8, 'Pooja', '{"from":"pooja@wtouch.in"}', '{"to":"aarti@wtouch.in","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"9854574587","address":"Vakad, Pune.","message":"Hi this is trail mail"}', '2015-04-10 11:50:55', '1', '1', '', '1', '2015-04-10 11:58:16', '{"subject":"RE: Website Enquiry","message":"<p>thanks!&nbsp;This is trial reply msg from smallBusiness!<\\/p>","from_email":"aarti@wtouch.in","name":"Aarti","to_email":"pooja@wtouch.in"}', '', ''),
(25, 8, 'Sunita', '{"from":"sunita@wtouch.in"}', '{"to":"aarti@wtouch.in","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"9854571554","address":"Karve Road, Pune","message":"I am interested in ordering products related to hairs"}', '2015-04-10 11:59:09', '1', '1', '', '0', '0000-00-00 00:00:00', '', '', ''),
(26, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"pooja@wtouch.in","cc":"sunita@wtouch.in"}', 'asch kla', '<p>hiiiiiii</p>', '2015-04-12 15:58:26', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(27, 3, 'sai', '{"from":"sunita@wtouch.in"}', '{"to":"","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"7865465466","address":"pune","message":"trial msg"}', '2015-04-13 16:37:36', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(28, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilas@wtouch.in"}', 'trial after updating dbHelper.', '<p>fsdfsfsd</p>', '2015-04-14 21:54:02', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(29, 17, 'sai', '{"from":"sunita@wtouch.in"}', '{"to":"","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"8795423320","address":"pune","message":"Enquiry for art project"}', '2015-04-17 18:11:45', '1', '1', '', '0', '0000-00-00 00:00:00', '', '', ''),
(30, 3, 'sai', '{"from":"sunita@wtouch.in"}', '{"to":"","cc":"vilas@wtouch.in"}', 'Health Care Center12', '{"phone":"7845512111","address":"pune","message":"trial message"}', '2015-04-17 18:45:41', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(31, 25, 'lkjfdkl', '{"from":"vilas@wtouch.in"}', '{"to":"shital@gmail.com","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"7641635465","address":"465465464fdfdfa","message":"564fddfs"}', '2015-04-18 11:06:42', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(32, 0, 'smita', '{"from":"sunita@wtouch.in"}', '{"to":"","cc":"vilas@wtouch.in"}', '', '{"phone":"8796163303","address":"pune","message":"trial message for enquiry"}', '2015-04-18 12:19:05', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(33, 8, 'Supriya Bhandari', '{"from":"supriya@gmail.com"}', '{"to":"aarti@wtouch.in","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"9874584578","address":"Ahmednagar.","message":"Hi I want to buy a hair products"}', '2015-04-18 14:32:05', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(34, 8, 'Priyanka', '{"from":"priya@gmail.com"}', '{"to":"aarti@wtouch.in","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"9854125456","address":"Mumbai","message":"Hi I want to buy skin products"}', '2015-04-18 14:42:39', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(35, 8, 'Sandip', '{"from":"sandip@gmail.com"}', '{"to":"aarti@wtouch.in","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"9854512254","address":"Nasik","message":"Trial Mail"}', '2015-04-18 15:03:13', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(36, 8, 'Sanjay', '{"from":"sanju@yahoo.com"}', '{"to":"aarti@wtouch.in","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"8574581225","address":"Ahmednagar","message":"Trial Mail"}', '2015-04-18 15:10:05', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(37, 8, 'Kinjal', '{"from":"kinjal@gmail.com"}', '{"to":"aarti@wtouch.in","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"9854745154","address":"Nasik","message":"Trial Mail"}', '2015-04-18 18:16:35', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(38, 0, 'sai', '{"from":"sunita@wtouch.in"}', '{"to":"{{data.owner_email}}","cc":"vilas@wtouch.in"}', '{{data.business_name}}', '{"phone":"8792222233","address":"pune","message":"trial message"}', '2015-04-19 08:12:44', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(39, 0, 'sunita', '{"from":"sunita@wtouch.in"}', '{"to":"{{data.owner_email}}","cc":"vilas@wtouch.in"}', 'Portal Enquiry', '{"phone":"9552222222","address":"pune","message":"hiiiiiiiiiiiii"}', '2015-04-19 08:21:34', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(40, 0, 'sunita', '{"from":"sunita@wtouch.in"}', '{"to":"{{data.owner_email}}","cc":"vilas@wtouch.in"}', 'Portal Enquiry{{data.business_name}}', '{"phone":"9955555222","address":"pune","message":"trial msg"}', '2015-04-19 08:26:02', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(41, 0, 'sunita', '{"from":"sunita@wtouch.in"}', '{"to":"{{data.owner_email}}","cc":"vilas@wtouch.in"}', 'Portal Enquiry', '{"phone":"8796163303","address":"pune","message":"helllo"}', '2015-04-19 08:27:56', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(42, 0, 'sunita', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":""}', 'Portal Enquiry: Iris Hotel', '{"phone":"8755522522","address":"pune","message":"trial message"}', '2015-04-19 10:02:31', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(43, 0, 'vilas', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":""}', 'Portal Enquiry: Iris Hotel', '{"phone":"7543564564","address":"lkdfj","message":"jkld"}', '2015-04-19 10:02:31', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(44, 7, 'vilas', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: Iris Hotel', '{"phone":"8445574554","address":"dsasd","message":"dsfa"}', '2015-04-19 10:22:45', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(45, 7, 'vilas', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: Iris Hotel', '{"phone":"8445574554","address":"dsasd","message":"dsfa"}', '2015-04-19 10:22:45', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(46, 7, 'sunita', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: Iris Hotel', '{"phone":"8714252202","address":"pune","message":"trial message"}', '2015-04-19 10:50:50', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(47, 7, 'sai', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: Iris Hotel', '{"phone":"8795552222","address":"pune","message":"reply msg check"}', '2015-04-19 11:19:50', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(48, 3, 'sunita', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: Health Care Center12', '{"phone":"8745521112","address":"pune","message":"hiiiiiii"}', '2015-04-19 13:11:30', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(49, 8, 'Anushka', '{"from":"anu@gmail.com"}', '{"to":"aarti@wtouch.in","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"9854715451","address":"Delhi","message":"Trial Mail"}', '2015-04-19 13:12:56', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(50, 3, 'aarti', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: Health Care Center12', '{"phone":"8796735864","address":"pune","message":"hii this is trial"}', '2015-04-19 13:14:12', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(51, 7, 'vilas', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"trupti@wtouch.in"}', 'Portal Enquiry: Iris Hotel', '{"phone":"8445574554","address":"dsasd","message":"dsfa"}', '2015-04-19 10:22:45', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(52, 7, 'vilas', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"trupti@wtouch.in"}', 'Portal Enquiry: Iris Hotel', '{"phone":"8445574554","address":"dsasd","message":"dsfa"}', '2015-04-19 10:22:45', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(53, 7, 'vilas', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"trupti@wtouch.in"}', 'Portal Enquiry: Iris Hotel', '{"phone":"8445574554","address":"dsasd","message":"dsfa"}', '2015-04-19 10:22:45', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(54, 3, 'sai', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: Health Care Center12', '{"phone":"8795521122","address":"pune","message":"trial message for mgs check"}', '2015-04-20 14:24:30', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(55, 34, 'amarnatha', '{"from":"amarnathayan_k@yahoo.com","cc":""}', '{"to":"amar@wtouch.in"}', 'dhnsvuyh', '<p>dfsf</p>', '2015-04-20 20:42:01', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(56, 34, 'amarnatha', '{"from":"amarnathayan_k@yahoo.com","cc":""}', '{"to":"amarnathdeonikar@yahoo.com"}', 'gnujfur', '<p>rdthnrutn</p>', '2015-04-20 20:42:01', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(57, 8, 'Vilas Shetkar', '{"from":"vilas@wtouch.in"}', '{"to":"aarti@wtouch.in","cc":"vilas@wtouch.in"}', 'Website Enquiry', '{"phone":"7545465465","address":"pune","message":"trial msg"}', '2015-04-20 20:52:46', '1', '1', '', '1', '2015-04-20 20:53:28', '{"subject":"RE: Website Enquiry","message":"<p>thanks we will call you back.<\\/p>","from_email":"aarti@wtouch.in","name":"Aarti","to_email":"vilas@wtouch.in"}', '', ''),
(58, 8, 'Vilas Shetkar', '{"from":"support@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: Jovees Cosmetics', '{"phone":"7465454546","address":"pune city","message":"trial msg from apna site portal."}', '2015-04-20 20:55:04', '1', '1', '', '0', '0000-00-00 00:00:00', '', '', ''),
(59, 0, 'Vilas Shetkar', '{"from":"vilas@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: aaaa', '{"phone":"7641654654","address":"pune","message":"jkldsjl"}', '2015-04-21 19:17:46', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(60, 31, 'sunita', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"helth@gmail.com"}', 'Portal Enquiry: Web Touch', '{"phone":"8974412222","address":"pune","message":"trial message"}', '2015-04-23 14:48:57', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(61, 19, 'sunita', '{"from":"sunita@wtouch.in"}', '{"to":"","cc":"vilas@wtouch.in"}', 'Portal Enquiry: ComputerHouse', '{"phone":"8795214222","address":"ahmednagar","message":"enquiry for computer house"}', '2015-04-23 15:25:54', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(62, 17, 'sunita', '{"from":"sunita@wtouch.in"}', '{"cc":"vilas@wtouch.in","to":"vilas@wtouch.in"}', 'Portal Enquiry: Seema business', '{"phone":"8722225256","address":"ahmednagar","message":"hiiiiiiiiii"}', '2015-04-23 16:03:16', '1', '0', '', '0', '0000-00-00 00:00:00', '', '', ''),
(63, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"sunita@wtouch.in"}', 'trial', '<p>hii</p>', '2015-04-24 17:22:07', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(64, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilasshetkar@gmail.com"}', 'Vilas test gmail', '<p>fjlskdfjlskdf jlsdkfjdsl&nbsp;</p>', '2015-04-29 14:44:47', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(65, 7, 'trupti', '{"from":"trupti@wtouch.in","cc":""}', '{"to":"vilasshetkar@gmail.com"}', 'trial from other email', '<p>fjdslkfjlsdkf&nbsp;</p>', '2015-04-29 14:44:47', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(66, 7, 'trupti', '{"from":"trupti@wtouch.in","cc":""}', '{"to":"vilasshetkar@gmail.com"}', 'dsfasf', '<p>fsfsdfsda</p>', '2015-04-29 14:44:47', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(67, 7, 'trupti', '{"from":"trupti@wtouch.in","cc":""}', '{"to":"vilasshetkar@gmail.com"}', 'Activate your account', '<p>Dear User, <a href="#/changepass/7ee117f3a4619147b421eee1cda6e3ab">Click here to reset your password</a>&nbsp;</p>', '2015-04-29 15:16:05', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(68, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilasshetkar@gmail.com"}', 'activate your account', '<p>Dear User, <a href="#/activate/78a9b4053bca5994f91be2c752010551/vilasshetkar@gmail.com/true">Click here to activate your account</a></p>', '2015-04-29 15:20:24', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(69, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilasshetkar@gmail.com"}', 'lfdsjf', '<p>lfkdjslkafsjlfksd</p>', '2015-04-29 15:20:24', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(70, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilasshetkar@gmail.com"}', 'fjsdklfd', '<p>fjdlksfjsdl</p>', '2015-04-29 15:18:25', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', ''),
(71, 1, 'vilas', '{"from":"vilas@wtouch.in","cc":""}', '{"to":"vilas@wtouch.in"}', 'fjdkf', '<p>fdjksfjdk</p>', '2015-04-29 16:37:05', '2', '0', '[]', '0', '0000-00-00 00:00:00', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
CREATE TABLE IF NOT EXISTS `invoice` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) NOT NULL,
  `property_id` int(10) NOT NULL,
  `due_date` date NOT NULL,
  `previous_due` int(10) NOT NULL,
  `total_amount` int(10) NOT NULL,
  `duration` varchar(256) NOT NULL,
  `generated_date` date NOT NULL,
  `perticulars` text NOT NULL,
  `rent` int(10) NOT NULL,
  `remark` longtext NOT NULL,
  `payment_status` enum('0','1','2') NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=53 ;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`id`, `user_id`, `property_id`, `due_date`, `previous_due`, `total_amount`, `duration`, `generated_date`, `perticulars`, `rent`, `remark`, `payment_status`, `status`) VALUES
(34, 8, 4, '2015-06-04', 0, 9169, '', '2015-06-04', '{"Licence Fee" : "8000","electricity_bill":0,"water_charge":"0","maintenance":"900","tax":960,"tds":800,"other_tax":80,"primaryeducation":19.2,"secondaryeducation":9.6}', 8000, 'Being Invoice for <strong>Jun-2015</strong> Licence Fee & Maintance Charges against Agr. for Shop premise area Shop No. Sr.No. 32/39, Thathawade, Thathwade, Pune, Maharashtra, India - 400323', '0', '1'),
(36, 8, 4, '2015-06-04', 0, 9169, '', '2015-06-04', '{"electricity_bill":0,"water_charge":"0","maintenance":"900","tax":960,"tds":800,"other_tax":80,"primaryeducation":19.2,"secondaryeducation":9.6}', 8000, 'Being Invoice for Jun-2015 Licence Fee & Maintance Charges against Agr. for Shop premise area Shop No. Sr.No. 32/39, Thathawade, Thathwade, Pune, Maharashtra, India - 400323', '1', '1'),
(37, 8, 4, '2016-10-24', 0, 5668, '', '2015-06-04', '{"electricity_bill":0,"water_charge":"0","maintenance":"500","tax":600,"tds":500,"other_tax":50,"primaryeducation":12,"secondaryeducation":6}', 5000, 'Being Invoice for Jun-2015 Licence Fee & Maintance Charges against Agr. for Shop premise area Shop No. Sr.No. 32/39, Thathawade, Thathwade, Pune, Maharashtra, India - 400323', '2', '1'),
(38, 8, 4, '2015-06-04', 0, 115379, '', '2015-06-04', '{"electricity_bill":0,"water_charge":"8555","maintenance":"98555","tax":960,"tds":800,"other_tax":80,"primaryeducation":19.2,"secondaryeducation":9.6}', 8000, 'Being Invoice for Jun-2015 Licence Fee & Maintance Charges against Agr. for Shop premise area Shop No. Sr.No. 32/39, Thathawade, Thathwade, Pune, Maharashtra, India - 400323', '0', '1'),
(39, 8, 4, '2015-06-04', 0, 5168, '', '2015-06-04', '{"electricity_bill":0,"water_charge":"0","maintenance":"500","tax":600,"tds":500,"other_tax":50,"primaryeducation":12,"secondaryeducation":6}', 5000, 'Being Invoice for Jun-2015 Licence Fee & Maintance Charges against Agr. for Shop premise area Shop No. Sr.No. 32/39, Thathawade, Thathwade, Pune, Maharashtra, India - 400323', '1', '1'),
(40, 1, 0, '2015-06-15', 0, 2218, '', '2015-06-05', '{"tax":54.6,"tds":45.5,"other_tax":4.55,"primaryeducation":1.092,"secondaryeducation":0.546,"rent":"455","electricity_bill":"546","water_charge":"546","maintenance":"656"}', 0, '', '0', '1'),
(41, 1, 0, '2015-06-15', 0, 31269, '', '2015-06-05', '{"tax":960,"tds":800,"other_tax":80,"primaryeducation":19.2,"secondaryeducation":9.6,"rent":"8000","electricity_bill":"9000","water_charge":"5000","maintenance":"9000"}', 0, '', '0', '1'),
(42, 1, 0, '2015-06-15', 0, 18836285, '', '2015-06-05', '{"tax":54545.4,"tds":45454.5,"other_tax":4545.45,"primaryeducation":1090.908,"secondaryeducation":545.454,"rent":"454545","electricity_bill":"7778889","water_charge":"788789","maintenance":"9798789"}', 0, '', '1', '1'),
(43, 24, 4, '2016-10-23', 0, 5168, '', '2015-06-05', '{"electricity_bill":0,"water_charge":"0","maintenance":"500","tax":600,"tds":500,"other_tax":50,"primaryeducation":12,"secondaryeducation":6}', 5000, '', '1', '1'),
(44, 26, 4, '2016-10-25', 0, 5168, '', '2015-06-05', '{"electricity_bill":0,"water_charge":"0","maintenance":"500","tax":600,"tds":500,"other_tax":50,"primaryeducation":12,"secondaryeducation":6}', 5000, '', '2', '1'),
(45, 8, 4, '2016-10-24', 0, 5168, '', '2015-06-05', '{"electricity_bill":0,"water_charge":"0","maintenance":"500","tax":600,"tds":500,"other_tax":50,"primaryeducation":12,"secondaryeducation":6}', 5000, '', '2', '1'),
(46, 17, 4, '2016-10-24', 0, 7535, '', '2015-06-05', '{"rent":"7000","electricity_bill":0,"water_charge":"100","maintenance":"200","tax":840,"tds":null,"other_tax":70,"primaryeducation":16.8,"secondaryeducation":8.4}', 0, '', '1', '1'),
(47, 17, 4, '2016-10-24', 0, 7535, '', '2015-06-05', '{"rent":"7000","electricity_bill":0,"water_charge":"100","maintenance":"200","tax":840,"tds":null,"other_tax":70,"primaryeducation":16.8,"secondaryeducation":8.4}', 0, '', '1', '1'),
(48, 8, 4, '2016-10-25', 0, 9169, '', '2015-06-05', '{"rent":"8000","electricity_bill":0,"water_charge":"0","maintenance":"900","tax":960,"tds":null,"other_tax":80,"primaryeducation":19.2,"secondaryeducation":9.6}', 0, 'Being Invoice for Jun-2015 Licence Fee & Maintance Charges against Agr. for Shop premise area Shop No. Sr.No. 32/39, Thathawade, Thathwade, Pune, Maharashtra, India - 400323', '1', '1'),
(49, 8, 4, '2015-06-15', 0, 9169, '', '2015-06-05', '{"rent":"8000","electricity_bill":0,"water_charge":"0","maintenance":"900","tax":960,"tds":null,"other_tax":80,"primaryeducation":19.2,"secondaryeducation":9.6}', 0, '', '1', '1'),
(50, 17, 25, '2015-06-15', 0, 9069, '', '2015-06-05', '{"rent":"8000","electricity_bill":0,"water_charge":"0","maintenance":"800","tax":960,"tds":800,"other_tax":80,"primaryeducation":19.2,"secondaryeducation":9.6}', 0, '', '1', '1'),
(51, 26, 54, '2015-06-17', 0, 6468, '', '2015-06-07', '{"rent":"5000","electricity_bill":"500","water_charge":"300","maintenance":"500","tax":600,"tds":500,"other_tax":50,"primaryeducation":12,"secondaryeducation":6}', 0, 'Being Invoice for June-2015 Licence Fee & Maintance Charges against Agr. for Amar Property Nashik, premise area Tiruppur, Coimbatore, 15 Velampalayam -641652', '1', '1'),
(52, 89, 55, '2015-06-17', 0, 9577, '', '2015-06-07', '{"rent":"4000","electricity_bill":0,"water_charge":"0","maintenance":"5000","tax":560,"tds":0,"other_tax":0,"primaryeducation":5.6,"secondaryeducation":11.2}', 0, 'Being Invoice for June-2015 Licence Fee & Maintance Charges against Agr. for Vilas Property fsdfjasdfh, premise area dsfadsf, dsfdsf, dsfads-656546', '2', '1');

-- --------------------------------------------------------

--
-- Table structure for table `property`
--

DROP TABLE IF EXISTS `property`;
CREATE TABLE IF NOT EXISTS `property` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(256) NOT NULL,
  `type` varchar(256) NOT NULL,
  `property_for` enum('Sale','Rent','PG') NOT NULL DEFAULT 'Rent',
  `category` varchar(256) NOT NULL,
  `date` datetime NOT NULL,
  `property_description` text NOT NULL,
  `property_info` varchar(256) NOT NULL,
  `price` varchar(256) NOT NULL,
  `deposit` int(10) NOT NULL,
  `currency` varchar(256) NOT NULL,
  `property_images` longtext NOT NULL,
  `floor_no` varchar(256) NOT NULL,
  `property_location` longtext NOT NULL,
  `contact_details` longtext NOT NULL,
  `optional_property_details` longtext NOT NULL,
  `landmarks` varchar(256) NOT NULL,
  `amenities` varchar(256) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  `availability` enum('0','1') NOT NULL DEFAULT '1',
  `user_id` int(11) NOT NULL,
  `verified` enum('0','1') NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=57 ;

--
-- Dumping data for table `property`
--

INSERT INTO `property` (`id`, `title`, `type`, `property_for`, `category`, `date`, `property_description`, `property_info`, `price`, `deposit`, `currency`, `property_images`, `floor_no`, `property_location`, `contact_details`, `optional_property_details`, `landmarks`, `amenities`, `status`, `availability`, `user_id`, `verified`) VALUES
(4, 'Shop', 'Office Space', 'Sale', 'Commercial Property', '0000-00-00 00:00:00', 'This shop for rent', '{"buildup_area":"200","land_area":"1000","carpet_area":"175","build_unit":"Feet","land_unit":"Feet","carpet_unit":"Feet","bedrooms":"1","bathrooms":"1"}', '8000', 9000, '', '[{"file_name":"Hydrangeas (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":162048,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Hydrangeas (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Hydrangeas (FILEminimizer).jpg"},{"file_name":"Jellyfish - Copy (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":131801,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Jellyfish - Copy (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Jellyfish - Copy (FILEminimizer).jpg"}]', '04', '{"country":"India","address":"Shop No. Sr.No. 32\\/39","state":"Maharashtra","city":"Pune","location":"Thathawade","area":"Thathwade","pincode":"400323"}', '{"contact_person":"poo","mobile":"7978978978","cont_address":"gfdgfdgfdg","email":"pooja@gmail.com"}', 'unfurnished', 'hospital 2km', '["Power Backup","Water Storage","Reserve Parking"]', '1', '0', 8, '0'),
(7, 'Sales', 'Commercial Lands & Plots', 'PG', 'Commercial Property', '2015-04-11 12:47:55', 'Apartment system. ', '{"buildup_area":"789","land_area":"879","carpet_area":"789","build_unit":"Cent","land_unit":"Yard","carpet_unit":"Feet","bedrooms":"4","bathrooms":"3"}', '89789', 0, '', '[{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"},{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"},{"file_name":"Tulips.jpg","file_type":"image\\/jpeg","file_size":620888,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips.jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips.jpg"},{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"}]', '', '{"address":"Pune","location":"Tathwade"}', '{"contact_person":"Aarti","email":"poo@g.ui","cont_address":"gjghjghj"}', '{"property_age":"5 to 10 years","furnished":"Unfurnished","ownership":"Others","property_floor":"3","facing":"South","parking":"4","transType":"New Property"}', '{"hospitals":"2","airport":"2","railway":"2","school":"2"}', '["Lift","GYM","Servant Quarters"]', '1', '1', 0, '0'),
(15, 'deleted property', 'Society Housing', 'Rent', 'Commercial Property', '2015-04-12 19:10:50', 'erfsdfsdf', '{"build_unit":"Cent","land_area":"45","buildup_area":"5","carpet_area":"66","land_unit":"Cent","carpet_unit":"Feet"}', '454434', 0, '', '[{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"},{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"},{"file_name":"Tulips.jpg","file_type":"image\\/jpeg","file_size":620888,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips.jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips.jpg"},{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"}]', '', '{"area":"fd","pincode":"411033","city":"Pune","state":"Maharashtra","country":"India"}', '', '', '', '["Water Storage","Maintenance Staff"]', '0', '1', 8, '0'),
(16, '', 'Warehouse/Godown', 'Rent', 'bulding', '2015-04-12 19:14:11', '', '{"Bedrooms":"3","bathrooms":"4"}', '56756', 0, '', '[{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"},{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"},{"file_name":"Tulips.jpg","file_type":"image\\/jpeg","file_size":620888,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips.jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips.jpg"},{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"}]', '', '', '', '', '', '', '0', '1', 8, '0'),
(17, 'Real estate portal', 'Apartments', 'Rent', 'residential', '2015-04-12 19:14:11', '', '', '', 0, '', '[{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"},{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"},{"file_name":"Tulips.jpg","file_type":"image\\/jpeg","file_size":620888,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips.jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips.jpg"},{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"}]', '', '{"country":"India","state":"Maharastra","city":"Akola","address":"Akola","location":"Akola"}', '', '', '', '', '1', '1', 0, '0'),
(18, '', '', 'Rent', '', '2015-05-08 11:05:18', '', '', '', 0, '', '[{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"},{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"},{"file_name":"Tulips.jpg","file_type":"image\\/jpeg","file_size":620888,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips.jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips.jpg"},{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"}]', '', '', '', '', '', '', '1', '1', 0, '0'),
(22, 'Twin Bunglow', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-06-04 15:01:00', 'This is Description for property.', '{"bedrooms":"2","bathrooms":"2"}', '5000000', 0, '', '[{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"}]', '', '{"address":"dhgfdg","area":"gsdfsd","location":"fgfgfgf","pincode":"656666","city":"Pune","state":"Maharashtra","country":"India","optional_property_details":{}}', '', '{"property_age":"under Construction","furnished":"Unfurnished","ownership":"Others","property_floor":"15","facing":"West","parking":"1","transType":"Resale Property"}', '{"hospitals":"5","railway":"5"}', '["Water Storage","Maintenance Staff","Swimming Pool"]', '1', '1', 1, '0'),
(25, 'Villas', 'Bunglaows/ Villas', 'Rent', 'Residential Property', '2015-05-25 18:20:06', 'This is Property.', '{"bedrooms":"1","bathrooms":"1"}', '700000', 0, 'Thousand', '[{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"}]', '', '{"area":"deccan","state":"Maharashtra","city":"Pune","country":"India"}', '', '{"property_age":"under Construction","furnished":"Furnished","ownership":"Individual","property_floor":"3","facing":"North","parking":"2","transType":"New Property"}', '{"hospitals":"4","airport":"5","railway":"3","school":"6"}', '["Water Storage","Maintenance Staff","Swimming Pool","Lift","GYM","Servant Quarters"]', '1', '1', 1, '0'),
(26, 'Bunglow', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-05-26 10:47:49', 'This is property for add', '{"bedrooms":"2","bathrooms":"2"}', '700000', 0, 'Thousand', '[{"file_name":"Chrysanthemum - Copy (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":234038,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg"}]', '', '{"area":"Pune Camp","state":"Maharashtra","city":"Pune","country":"India"}', '', '{"property_age":"under Construction","furnished":"Unfurnished","ownership":"Broker\\/Agent","property_floor":"5","facing":"East","parking":"2","transType":"Resale Property"}', '{"hospitals":"5","airport":"6","railway":"7","school":"8"}', '["Power Backup","Security","Water Storage","Maintenance Staff","Swimming Pool","Servant Quarters","GYM","Lift"]', '1', '1', 1, '0'),
(27, 'Twin Row House', 'Farm House', 'Rent', 'Residential Property', '2015-05-26 11:39:46', 'This is description for twin row house.', '{"bedrooms":"1","bathrooms":"2"}', '50000', 0, 'Thousand', '[{"file_name":"Desert - Copy (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":252266,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Desert - Copy (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Desert - Copy (FILEminimizer).jpg"}]', '', '{"area":"Thathwade","state":"Maharashtra","city":"Pune","country":"India"}', '', '{"property_age":"under Construction","furnished":"Unfurnished","ownership":"Individual","property_floor":"5","facing":"South","parking":"3","transType":"Resale Property"}', '{"hospitals":"5","airport":"5","railway":"6","school":"4"}', '["Power Backup","Security","Private Terrace","Swimming Pool","Maintenance Staff","Water Storage"]', '1', '1', 1, '0'),
(28, 'House', 'Office Space', 'Rent', 'Residential Property', '2015-05-26 18:19:34', 'This is desc for property Twin row house.', '{"bedrooms":"2"}', '5000', 0, 'In-Rupees', '[{"file_name":"Desert - Copy (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":252266,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Desert - Copy (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Desert - Copy (FILEminimizer).jpg"}]', '', '{"area":"gd","state":"Maharashtra","city":"pune","country":"india","pincode":"411033"}', '', '', '{"hospitals":"415","airport":"5241","railway":"524","school":"42"}', '["Power Backup","Security"]', '1', '1', 1, '0'),
(34, 'New', 'Society Housing', 'Rent', 'Residential Property', '2015-06-03 17:02:41', 'fggfhhgh ghgf', '{"bedrooms":"2","bathrooms":"3"}', '2000', 9000, '', '[{"file_name":"Chrysanthemum - Copy (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":234038,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg"}]', '', '{"area":"rtyrr","location":"fghgh","pincode":"767676","city":"hgfhfghgfh","country":"ghghgfh","state":"ghgfh"}', '', '{"property_age":"New Construction","furnished":"Unfurnished","facing":"East","transType":"Resale Property","property_floor":"2","parking":"2","ownership":"Others"}', '{"hospitals":"5","railway":"5","airport":"5","school":"5"}', '["Water Storage","Maintenance Staff","Swimming Pool"]', '0', '1', 1, '0'),
(35, 'aaaaa', 'Farm House', 'Rent', 'Agricultural Land', '2015-06-04 12:10:16', 'dfd', '{"bedrooms":"2","bathrooms":"2"}', '7000', 9000, '', '[{"file_name":"Chrysanthemum - Copy (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":234038,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg"}]', '', '{"area":"cvcxv","pincode":"545444","state":"gfgdfgfg","location":"fgfg","city":"fgfbvcvb","country":"vbvcb"}', '', '{"transType":"Resale Property","facing":"West","furnished":"Furnished","property_age":"New Construction","ownership":"Broker\\/Agent","property_floor":"2","parking":"2"}', '{"railway":"4","hospitals":"4","airport":"5","school":"6"}', '["Lift","GYM","Maintenance Staff","Water Storage","Swimming Pool"]', '0', '1', 1, '0'),
(37, 'eeee', 'Society Housing', 'Rent', 'Commercial Property', '2015-06-04 12:51:03', 'fggfdfg', '{"bedrooms":"2","bathrooms":"2"}', '8000', 9000, '', '[{"file_name":"Chrysanthemum - Copy (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":234038,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg"}]', '', '{"area":"trtr","pincode":"454545","state":"trtrtt","location":"fgfg","city":"fgfg","country":"vbc"}', '', '{"property_age":"New Construction","furnished":"Furnished","facing":"West","transType":"New Property","ownership":"Individual","property_floor":"2","parking":"1"}', '{"hospitals":"6","railway":"6","airport":"5","school":"4"}', '["Water Storage","Maintenance Staff","Swimming Pool"]', '0', '1', 1, '0'),
(38, 'asassa', 'Society Housing', 'Rent', 'Commercial Property', '2015-06-04 12:53:12', 'fgfg fgfdgdfg', '{"bedrooms":"2","bathrooms":"3"}', '9000', 8000, '', '[{"file_name":"Chrysanthemum - Copy (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":234038,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Chrysanthemum - Copy (FILEminimizer).jpg"}]', '', '{"area":"gfgfg","location":"gfgdg","pincode":"545454","city":"hghghfgh","country":"hghfgh","state":"ghgfhg"}', '', '{"property_age":"under Construction","furnished":"Furnished","facing":"South","transType":"Resale Property","ownership":"Broker\\/Agent","property_floor":"2","parking":"2"}', '{"hospitals":"5","railway":"4","airport":"2","school":"4"}', '["Water Storage"]', '0', '1', 1, '0'),
(40, 'Shop', 'Office Space', 'Rent', 'Commercial Property', '2015-06-04 14:55:47', '200Sq.Ft Office', '{"bedrooms":"1","bathrooms":"1"}', '', 0, '', '[{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"},{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"},{"file_name":"Tulips.jpg","file_type":"image\\/jpeg","file_size":620888,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips.jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips.jpg"},{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"}]', '', '{"address":"Shop No. Sr.No. 32\\/39","area":"fhgh","location":"Thathawade","pincode":"433434","city":"Pune","state":"Maharashtra","country":"India","optional_property_details":{}}', '', '', '{}', '["Servant Quarters"]', '1', '1', 1, '0'),
(41, 'Twin Bunglow', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-06-04 14:57:22', 'This is Description for property.', '{"bedrooms":"2","bathrooms":"2"}', '', 0, '', '[{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"}]', '', '{"address":"dhgfdg","area":"ggfh","location":"fgfgfgf","pincode":"565555","city":"Pune","state":"Maharashtra","country":"India","optional_property_details":{}}', '', '', '{"hospitals":"5","railway":"5"}', '["Maintenance Staff"]', '1', '1', 1, '0'),
(42, 'Twin Bunglow', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-06-04 14:58:54', 'This is Description for property.', '{"bedrooms":"2","bathrooms":"2"}', '', 0, '', '[{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"}]', '', '{"address":"dhgfdg","location":"fgfgfgf","city":"Pune","state":"Maharashtra","country":"India","optional_property_details":{}}', '', '', '{"hospitals":"5","railway":"5"}', '', '1', '1', 1, '0'),
(43, 'Twin Bunglow', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-06-04 15:01:00', 'This is Description for property.', '{"bedrooms":"2","bathrooms":"2"}', '', 0, '', '[{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"}]', '', '{"address":"dhgfdg","location":"fgfgfgf","city":"Pune","state":"Maharashtra","country":"India","optional_property_details":{}}', '', '', '{"hospitals":"5","railway":"5"}', '', '1', '1', 1, '0'),
(44, 'Deep Bunglow', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-06-04 15:47:28', 'fdfd', '{"bedrooms":"2","bathrooms":"2"}', '565656', 56565, '', '[{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"},{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"},{"file_name":"Tulips.jpg","file_type":"image\\/jpeg","file_size":620888,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips.jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips.jpg"},{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"}]', '', '{"area":"hghgh","pincode":"676765","location":"hghg","city":"hghgfh","country":"ghgbvb","state":"vbcvb"}', '', '', '', '["Water Storage","Maintenance Staff","Swimming Pool"]', '1', '1', 1, '0'),
(45, 'Apartment', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-06-04 17:02:38', 'This is Well furnished property.', '{"bedrooms":"4","bathrooms":"4"}', '9000', 90000, '', '[{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"},{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"},{"file_name":"Tulips.jpg","file_type":"image\\/jpeg","file_size":620888,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips.jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips.jpg"},{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"}]', '', '{"area":"Deccan","location":"Deccan","pincode":"401101","city":"Pune","state":"Maharashtra","country":"India"}', '', '{"property_age":"New Construction","furnished":"Furnished","ownership":"Individual","property_floor":"3","parking":"2","facing":"West","transType":"Resale Property"}', '{"hospitals":"6","railway":"5","school":"6","airport":"4"}', '["Water Storage","Maintenance Staff","Swimming Pool","Servant Quarters","GYM","Lift","Reserve Parking"]', '1', '1', 1, '0'),
(46, 'Shop Floor 2', 'Office Space', 'Rent', 'Commercial Property', '2015-06-04 17:28:46', 'This shop for rent', '{"buildup_area":"200","land_area":"1000","carpet_area":"175","build_unit":"Feet","land_unit":"Feet","carpet_unit":"Feet","bedrooms":"1","bathrooms":"1"}', '', 9000, '', '[{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"},{"file_name":"Lighthouse.jpg","file_type":"image\\/jpeg","file_size":561276,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse.jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse.jpg"},{"file_name":"Tulips.jpg","file_type":"image\\/jpeg","file_size":620888,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips.jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips.jpg"},{"file_name":"Penguins.jpg","file_type":"image\\/jpeg","file_size":777835,"file_path":"E:\\\\Users\\\\Vilas\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Penguins.jpg","file_relative_path":"\\/uploads\\/undefined\\/Penguins.jpg"}]', '', '{"country":"India","address":"Shop No. Sr.No. 32\\/39","state":"Maharashtra","city":"Pune","location":"Thathawade","area":"Thathwade","pincode":"400323"}', '', 'unfurnished', 'hospital 2km', '["Power Backup","Water Storage","Reserve Parking"]', '1', '1', 1, '0'),
(48, 'White House', 'Individual House/ Home', 'Rent', 'Residential Property', '2015-06-04 19:15:39', 'This is well furnished property', '{"bedrooms":"1","bathrooms":"2"}', '7000', 9000, '', '', '2', '{"area":"Deccan","location":"Deccan corner","pincode":"408433","city":"Pune","state":"Maharashtra","country":"India"}', '', '{"property_age":"New Construction","furnished":"Furnished","transType":"Resale Property","ownership":"Others","property_floor":"2","parking":"2","facing":"West"}', '{"hospitals":"6","railway":"7","airport":"8","school":"8"}', '["Water Storage","Maintenance Staff","Swimming Pool"]', '1', '0', 1, '0'),
(52, 'New White House', 'Individual House/ Home', 'Rent', 'Commercial Property', '2015-06-05 12:26:56', 'This property for rent.', '{"bedrooms":"2","bathrooms":"2"}', '6000', 8000, '', '[{"file_name":"Desert (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":252266,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Desert (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Desert (FILEminimizer).jpg"},{"file_name":"Tulips (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":167571,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Tulips (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Tulips (FILEminimizer).jpg"},{"file_name":"Lighthouse - Copy (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":152183,"file_path":"E:\\\\Users\\\\Trupti\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/Lighthouse - Copy (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/Lighthouse - Copy (FILEminimizer).jpg"}]', '03', '{"area":"Deccan","location":"Deccan Corner","pincode":"400234","city":"Pune","state":"Maharashtra","country":"India"}', '', '{"property_age":"under Construction","furnished":"Furnished","facing":"East","transType":"New Property","ownership":"Individual","property_floor":"2","parking":"3"}', '{"hospitals":"6","railway":"5","airport":"4","school":"3"}', '["Water Storage","Maintenance Staff","Swimming Pool","Lift","GYM"]', '1', '0', 1, '0'),
(53, 'Amar', 'Commercial Shops', 'Rent', 'Commercial Property', '2015-06-06 19:20:48', 'abc', '{"bedrooms":"1","bathrooms":"1"}', '1000000', 1520000, '', '[{"file_name":"IMG-20150320-WA0008.jpg","file_type":"image\\/jpeg","file_size":153196,"file_path":"E:\\\\Users\\\\Dnyaneshwar\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/IMG-20150320-WA0008.jpg","file_relative_path":"\\/uploads\\/undefined\\/IMG-20150320-WA0008.jpg"}]', '01', '{"area":"Pune","location":"Pune","pincode":"411022","city":"PUNE","state":"Maharashatra","country":"India"}', '', '{"property_age":"New Construction","ownership":"Individual","furnished":"Furnished","property_floor":"1","facing":"East","parking":"1","transType":"New Property"}', '{"hospitals":"10","airport":"10","railway":"15","school":"2"}', '', '1', '0', 1, '0'),
(54, 'Amar Property', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-06-07 12:14:42', 'The Flat is at -1 level.', '{"bedrooms":"0","bathrooms":"0"}', '100000', 200000, '', '[{"file_name":"IMG-20150320-WA0019 (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":93831,"file_path":"E:\\\\Users\\\\Dnyaneshwar\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/IMG-20150320-WA0019 (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/IMG-20150320-WA0019 (FILEminimizer).jpg"}]', '00', '{"area":"near Udgir","location":"Udgir","pincode":"413517","city":"Udgir","state":"Maharashtra","country":"India"}', '', '{"property_age":"under Construction","ownership":"Individual","furnished":"Unfurnished","property_floor":"1","facing":"East","parking":"3","transType":"Resale Property"}', '{"hospitals":"4","airport":"60","railway":"1","school":"1"}', '["Water Storage","GYM","Park","Club House","Servant Quarters","Reserve Parking","Maintenance Staff","Swimming Pool","Power Backup","Security","Private Terrace"]', '1', '0', 1, '0'),
(55, 'Vilas Property', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-06-07 15:15:44', 'The property is only used for residential Purpose.', '{"bedrooms":"1","bathrooms":"1"}', '7000', 2000, '', '[{"file_name":"IMG-20150320-WA0016 (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":75691,"file_path":"E:\\\\Users\\\\Dnyaneshwar\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/IMG-20150320-WA0016 (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/IMG-20150320-WA0016 (FILEminimizer).jpg"}]', '02', '{"area":"Chinchwad","location":"Pimpary","pincode":"411741","city":"Pune","state":"Maharashtra","country":"India"}', '', '{"property_age":"0 to 5 years","ownership":"Others","furnished":"Furnished","property_floor":"1","parking":"No Parking","facing":"South","transType":"Resale Property"}', '{"hospitals":"2","airport":"5","railway":"3","school":"2"}', '["Power Backup","Security","Private Terrace","Water Storage","Maintenance Staff"]', '1', '1', 89, '0'),
(56, 'Dnyaneshwar Shetkar', 'Flats & Apartment', 'Rent', 'Residential Property', '2015-06-07 16:45:18', 'Dnyaneshwar Shetkar property.', '{"bedrooms":"0","bathrooms":"1"}', '8000', 3000, '', '[{"file_name":"IMG-20150320-WA0016 (FILEminimizer).jpg","file_type":"image\\/jpeg","file_size":75691,"file_path":"E:\\\\Users\\\\Dnyaneshwar\\\\Project Code\\\\Real-Estate-Rent-Module\\\\www\\/uploads\\/undefined\\/IMG-20150320-WA0016 (FILEminimizer).jpg","file_relative_path":"\\/uploads\\/undefined\\/IMG-20150320-WA0016 (FILEminimizer).jpg"}]', '01', '{"area":"fgsfdg","location":"fgsdfg","pincode":"421578","city":"sdfgfg","state":"fdgdf","country":"fdgsfdg"}', '', '{"property_age":"under Construction","ownership":"Individual","furnished":"Furnished","property_floor":"1","facing":"South","parking":"No Parking","transType":"Resale Property"}', '{"hospitals":"2","airport":"3","railway":"2","school":"5"}', '["Power Backup","Security","Private Terrace"]', '1', '0', 89, '0');

-- --------------------------------------------------------

--
-- Table structure for table `rent`
--

DROP TABLE IF EXISTS `rent`;
CREATE TABLE IF NOT EXISTS `rent` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `property_id` int(10) NOT NULL,
  `title` varchar(256) NOT NULL,
  `user_id` int(10) NOT NULL,
  `rent` int(50) NOT NULL,
  `deposit` int(10) NOT NULL,
  `maintenance` int(10) NOT NULL DEFAULT '200',
  `electricity_bill` varchar(256) NOT NULL,
  `water_charge` int(10) NOT NULL,
  `duration` varchar(256) NOT NULL,
  `escduration` int(10) NOT NULL,
  `escalation_amount` int(10) NOT NULL,
  `taken_date` date NOT NULL,
  `leaving_date` date NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  `date_of_rent` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=18 ;

--
-- Dumping data for table `rent`
--

INSERT INTO `rent` (`id`, `property_id`, `title`, `user_id`, `rent`, `deposit`, `maintenance`, `electricity_bill`, `water_charge`, `duration`, `escduration`, `escalation_amount`, `taken_date`, `leaving_date`, `status`, `date_of_rent`) VALUES
(1, 4, 'Shop', 17, 7000, 50000, 200, 'renter', 100, '13', 13, 5, '2015-05-17', '2015-06-04', '1', 0),
(2, 4, 'Shop', 8, 8000, 8000, 900, 'Owner', 0, '14', 25, 7, '2015-05-25', '2015-06-05', '1', 0),
(3, 4, 'Shop', 17, 8000, 60000, 800, 'Owner', 0, '26', 25, 5, '2015-05-27', '2015-06-03', '1', 0),
(4, 4, 'Shop', 8, 5000, 50000, 500, 'renter', 0, '13', 13, 0, '2015-05-27', '2015-06-04', '1', 0),
(5, 4, 'Shop', 26, 5000, 50000, 500, 'Owner', 0, '14', 13, 1, '2015-05-31', '2015-06-04', '1', 0),
(6, 4, 'Shop', 24, 5000, 50000, 500, '', 0, '12', 6, 10, '2015-05-31', '2016-05-31', '1', 0),
(7, 25, 'Villas', 23, 8000, 8000, 1000, '', 0, '46', 38, 2, '2015-06-01', '2015-06-07', '1', 0),
(8, 25, 'Villas', 17, 8000, 9000, 800, '', 0, '14', 15, 7, '2015-06-02', '2015-06-04', '1', 0),
(10, 0, '', 17, 9000, 9000, 900, '', 0, '13', 25, 7, '2015-06-03', '2015-06-04', '1', 0),
(11, 26, 'Bunglow', 25, 5000, 50000, 500, '', 0, '18', 5, 10, '2015-06-03', '2015-06-04', '1', 0),
(12, 25, 'Villas', 26, 5000, 50000, 500, '', 0, '11', 0, 0, '2015-06-04', '2016-05-04', '1', 1),
(13, 26, 'Bunglow', 19, 70000, 7000, 800, '', 0, '14', 13, 7, '2015-06-04', '2016-08-04', '1', 3),
(14, 4, 'Shop', 23, 15000, 15000, 1500, '', 0, '23', 23, 1500, '2015-06-06', '2017-05-06', '1', 1),
(15, 54, 'Amar Property', 26, 5000, 5000, 500, '', 0, '18', 12, 10, '2015-06-07', '2016-12-07', '1', 4),
(16, 55, 'Vilas Property', 89, 4000, 5000, 5000, '', 0, '13', 51, 12, '2015-06-07', '2015-06-07', '1', 1),
(17, 56, 'Dnyaneshwar Shetkar', 89, 8000, 5000, 3000, '', 0, '12', 41, 12, '2015-06-07', '2016-06-07', '1', 5);

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
CREATE TABLE IF NOT EXISTS `transaction` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `account_no` int(11) NOT NULL,
  `user_id` int(10) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `type` varchar(256) NOT NULL,
  `category` varchar(256) NOT NULL,
  `description` text NOT NULL,
  `date` datetime NOT NULL,
  `due_amount` int(10) NOT NULL,
  `credit_amount` int(10) NOT NULL,
  `debit_amount` int(12) NOT NULL,
  `balance` int(10) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=125 ;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`id`, `account_no`, `user_id`, `invoice_id`, `type`, `category`, `description`, `date`, `due_amount`, `credit_amount`, `debit_amount`, `balance`, `status`) VALUES
(53, 9, 1, 0, 'income', 'Commissions', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 10000, 0, 10000, '1'),
(54, 9, 1, 0, 'income', 'Commissions', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 15000, 0, 25000, '1'),
(55, 13, 1, 0, 'income', 'Investments', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 500, 0, 500, '1'),
(56, 15, 1, 0, 'income', 'Fees & Charges', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 1000, 0, 1000, '1'),
(58, 9, 1, 31, 'income', 'Fees,Charges & Subscription', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 9669, 0, 20000, '1'),
(59, 9, 1, 0, 'expence', 'Financial', '{"payment_type":{"type":"Cheque","cheque_no":"1011","Bank":"SBI","Branch":"Pune"}}', '2015-06-02 00:00:00', 0, 0, 5000, 15000, '1'),
(60, 10, 1, 0, 'income', 'Non-Profit', '{"payment_type":{"type":"Net Banking","transaction_No":"12","Bank":"Union","Branch":"Station Road"}}', '2015-06-02 00:00:00', 0, 10000, 0, 10000, '1'),
(61, 9, 1, 0, 'income', 'Sales Product & Services', '{"payment_type":{"type":"Cheque","check_no":"12","Bank":"BOM","Branch":"Bhingar"}}', '2015-06-02 00:00:00', 0, 1000, 0, 16000, '1'),
(62, 11, 1, 0, 'income', 'Professional Services', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 2000, 0, 2000, '1'),
(63, 10, 1, 0, 'expence', 'Household', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 0, 2000, 8000, '1'),
(64, 10, 1, 0, 'income', 'Investments', '{"payment_type":{"type":"Net Banking","transaction_No":"454","Bank":"BADODA","Branch":"Pune"}}', '2015-06-02 00:00:00', 0, 2000, 0, 10000, '1'),
(65, 10, 1, 0, 'expence', 'Household', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 0, 1000, 9000, '1'),
(66, 10, 1, 0, 'invoice_payment', 'Income', '{"payment_type":{"type":"Cheque","check_no":"5656","Bank":"Union","Branch":"Station Road"}}', '2015-06-02 00:00:00', 0, 9000, 0, 18000, '1'),
(67, 10, 2, 0, 'income', 'Income', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 2000, 0, 20000, '1'),
(69, 10, 2, 0, 'expence', 'Building & Equipments', '{"payment_type":{"type":"Cash"}}', '2015-06-02 00:00:00', 0, 0, 5000, 15000, '1'),
(71, 10, 1, 0, 'expence', 'Financial', '{"payment_type":{"type":"Net Banking","transaction_No":"009","Bank":"Dena","Branch":"Kothrud"}}', '2015-06-02 00:00:00', 0, 0, 10000, 5000, '1'),
(72, 38, 1, 0, 'income', 'Agriculture', '{"payment_type":{"type":"Cheque","check_no":"45","Bank":"HDFC","Branch":"Nagar"},"date":"2015-6-5 18:45:27"}', '2015-06-04 00:00:00', 0, 10000, 0, 10000, '1'),
(73, 38, 1, 0, 'income', 'Agriculture', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 12000, 0, 22000, '1'),
(74, 38, 1, 0, 'income', 'Non-Profit', '{"payment_type":{"type":"Net Banking","transaction_No":"122","Bank":"SBI","Branch":"Karve Road"},"date":"2015-6-4 19:1:22"}', '2015-06-04 00:00:00', 0, 2000, 0, 24000, '1'),
(76, 0, 0, 32, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 9169, 0, 0, '1'),
(77, 0, 0, 34, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 9169, 0, 0, '1'),
(78, 0, 0, 37, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 5168, 0, 0, '1'),
(79, 0, 0, 39, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 4500, 0, 0, '1'),
(80, 0, 0, 38, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 115379, 0, 0, '1'),
(81, 0, 0, 36, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 9169, 0, 0, '1'),
(82, 0, 0, 37, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 100, 0, 0, '1'),
(83, 0, 0, 37, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 500, 0, 0, '1'),
(84, 0, 0, 37, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 500, 0, 0, '1'),
(85, 0, 0, 39, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 100, 0, 0, '1'),
(86, 0, 0, 39, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-04 00:00:00', 0, 68, 0, 0, '1'),
(87, 0, 0, 39, '', '', '{"payment_type":{"type":"Net Banking","transaction_No":"350421","Bank":"HDFC","Branch":"pune"},"date":"2015-06-04"}', '2015-06-04 00:00:00', 0, 500, 0, 0, '1'),
(88, 0, 0, 39, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-05 00:00:00', 0, 5100, 0, 0, '1'),
(89, 0, 0, 39, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-05 00:00:00', 0, 68, 0, 0, '1'),
(90, 0, 0, 39, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-05 00:00:00', 0, 5168, 0, 0, '1'),
(91, 0, 0, 42, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-05 00:00:00', 0, 18836285, 0, 0, '1'),
(93, 38, 1, 0, 'income', 'Investments', '{"payment_type":{"type":"Net Banking","transaction_No":"121","Bank":"BOM","Branch":"Station Road"},"date":"2015-6-5 14:17:58"}', '2015-06-05 14:17:58', 0, 4000, 0, 40000, '1'),
(94, 38, 1, 0, 'expence', 'Financial', '{"payment_type":{"type":"Cash"}}', '2015-06-05 14:17:58', 0, 0, 3000, 37000, '1'),
(95, 38, 1, 0, 'income', 'Licence Fees', '{"payment_type":{"type":"Cash"}}', '2015-06-05 15:22:51', 0, 5000, 0, 42000, '1'),
(96, 38, 1, 0, 'income', 'Commissions', '{"payment_type":{"type":"Cash"}}', '2015-06-05 17:23:13', 0, 1000, 0, 31000, '1'),
(97, 38, 1, 0, 'expence', 'Household', '{"payment_type":{"type":"Cheque","cheque_no":"324","Bank":"SBI","Branch":"Ameynagar"}}', '2015-06-05 17:24:30', 0, 0, 1000, 30000, '1'),
(98, 0, 0, 50, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 5000, 0, 0, '1'),
(99, 0, 0, 50, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 1000, 0, 0, '1'),
(100, 0, 0, 50, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 1500, 0, 0, '1'),
(101, 0, 0, 50, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 1569, 0, 0, '1'),
(102, 0, 0, 49, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 9169, 0, 0, '1'),
(103, 0, 0, 49, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 9169, 0, 0, '1'),
(104, 0, 0, 48, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 9169, 0, 0, '1'),
(105, 0, 1, 43, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 5168, 0, 0, '1'),
(106, 0, 0, 47, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 7535, 0, 0, '1'),
(107, 0, 0, 46, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 7535, 0, 0, '1'),
(108, 0, 0, 44, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 100, 0, 0, '1'),
(109, 0, 1, 44, '', '', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 100, 0, 0, '1'),
(110, 38, 1, 0, 'income', 'Other Income', '{"payment_type":{"type":"Cash"}}', '2015-06-06 19:51:12', 0, 5000, 0, 35000, '1'),
(111, 0, 1, 45, 'invoice_payment', 'invoice', '{"payment_type":{"type":"Cash"}}', '2015-06-06 00:00:00', 0, 100, 0, 0, '1'),
(112, 0, 1, 51, 'invoice_payment', 'invoice', '{"payment_type":{"type":"Cash"}}', '2015-06-07 00:00:00', 0, 6468, 0, 0, '1'),
(113, 38, 1, 0, 'income', 'Agriculture', '', '2015-06-07 12:56:24', 0, 50, 0, 35050, '1'),
(114, 38, 1, 0, 'income', 'Licence Fees', '{"payment_type":{},"date":"2015-6-7 12:59:20"}', '2015-06-07 12:59:20', 0, 6000, 0, 41050, '1'),
(115, 38, 1, 0, 'income', 'Licence Fees', '{"payment_type":{"type":"Cash"}}', '2015-06-07 13:00:55', 0, 5000, 0, 46050, '1'),
(116, 38, 1, 0, 'income', 'Agriculture', '{"payment_type":{"type":"Cheque","check_no":"50000","Bank":"SBI","Branch":"9858454"},"date":"2015-6-7 13:4:12"}', '2015-06-07 13:04:12', 0, 10000, 0, 56050, '1'),
(117, 38, 1, 0, 'expense', 'Pets', '{"payment_type":{"type":"Cheque","cheque_no":"4000","Bank":"UNION","Branch":"solapur"}}', '2015-06-07 13:06:20', 0, 0, 8000, 48050, '1'),
(118, 38, 1, 0, 'income', 'Licence Fees', '{"payment_type":{"type":"Cash"},"date":"2015-6-7 13:49:29"}', '2015-06-07 13:49:29', 0, 5000, 0, 53050, '1'),
(119, 38, 1, 0, 'income', 'Licence Fees', '', '2015-06-07 13:49:44', 0, 90000, 0, 143050, '1'),
(120, 38, 1, 0, 'income', 'Agriculture', '{"payment_type":{"type":"Cash"},"date":"2015-6-7 13:57:10"}', '2015-06-07 13:57:10', 0, 9000, 0, 152050, '1'),
(121, 39, 89, 0, 'income', 'Licence Fees', '{"payment_type":{"type":"Cash"}}', '2015-06-07 18:05:40', 0, 5222, 0, 5222, '1'),
(122, 0, 89, 52, 'invoice_payment', 'invoice', '{"payment_type":{"type":"Cash"}}', '2015-06-07 00:00:00', 0, 200, 0, 0, '1'),
(123, 39, 89, 0, 'income', 'Licence Fees', '{"payment_type":{"type":"Cash"}}', '2015-06-07 18:29:09', 0, 6000, 0, 11222, '1'),
(124, 39, 89, 0, 'expense', 'Building & Equipments', '{"payment_type":{"type":"Cash"}}', '2015-06-07 18:34:09', 0, 0, 9000, 2222, '1');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL DEFAULT '1',
  `group_id` int(10) NOT NULL DEFAULT '4',
  `name` varchar(256) NOT NULL,
  `username` varchar(256) NOT NULL,
  `email` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  `user_img` longtext NOT NULL,
  `dob` date NOT NULL,
  `address` text NOT NULL,
  `country` varchar(256) NOT NULL,
  `state` varchar(256) NOT NULL,
  `phone` varchar(256) NOT NULL,
  `fax` varchar(256) NOT NULL,
  `website` varchar(256) NOT NULL,
  `config` longtext NOT NULL,
  `status` enum('1','0') NOT NULL DEFAULT '0',
  `register_date` datetime NOT NULL,
  `activation_date` datetime NOT NULL,
  `baned` enum('1','0') NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=93 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_id`, `group_id`, `name`, `username`, `email`, `password`, `user_img`, `dob`, `address`, `country`, `state`, `phone`, `fax`, `website`, `config`, `status`, `register_date`, `activation_date`, `baned`) VALUES
(1, 0, 1, 'Vilas Shetkar', 'vilas', 'vilas@wtouch.in', '$2a$10$df3d1efe7c88e10bc864auc.tIQIDBbvSNDxpP3m3jMPT7BwZq9MK', '/uploads/user/profile/1/Tulips (FILEminimizer).jpg', '2015-03-26', '{"address":"Thergaon, Pune.","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '9049508514', '741231214132', 'http://www.google.com', '{"addbusiness":true,"addbusinessDetails":"68","addProducts":true,"chooseTemplate":true,"requestSite":true,"rentsetting":{"other_tax":"1","service_tax":"12","primary_edu_cess":"2","secondary_edu_cess":"1","pan_no":"AAFPL1404N","tds":"10","service_tax_no":"AAFPL1404NST001"},"taxinfo":{"service_tax":0,"other_tax":0,"pan_no":0,"tin_no":0}}', '1', '2015-03-27 19:17:19', '2015-04-28 16:24:08', '0'),
(2, 3, 2, 'Vilas Shetkar', 'salseman', 'vilasshetkara@gmail.com', '2c17db23890bdccb037ca9c8689d667d', '', '2015-03-26', '{"city":"Pune"}', 'India', 'Maharashtra', '9049508514', '', '', '', '1', '2015-03-27 21:21:31', '0000-00-00 00:00:00', '0'),
(3, 7, 3, 'manager', 'manager', 'dnyaneshwarr@wtouch.in', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '2015-03-26', '{"city":"Pune"}', 'India', 'Maharashtra', '9049508514', '', '', '', '1', '2015-03-27 21:21:31', '2015-03-28 13:06:35', '0'),
(7, 1, 5, 'Trupti S. Misal', 'trupti', 'trupti@wtouch.in', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '/uploads/user/profile/7/Tulips.jpg', '1990-08-26', '{"address":"Ameynagar,D-4,Bhingar,Ahmednagar.","city":"Gandhi Nagar","location":"(Gandhinagar) Sector 22 ","area":"Gandhinagar","pincode":"382021"}', 'india', 'GUJARAT', '7588539968', '675676', 'http://wtouch.in', '{"rentsetting":{"service_tax":0,"other_tax":0,"pan_no":0,"tin_no":0}}', '1', '2015-04-02 13:13:40', '0000-00-00 00:00:00', '0'),
(8, 2, 4, 'Aarti', 'aarti', 'aarti@wtouch.in', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1990-09-26', '{"address":"Dange Chawk, Pimpri-Chinchwad, Pune","city":"Pune"}', 'India', 'Maharashtra', '8574598778', '1254', '', '{"addbusiness":true,"addbusinessDetails":"68","addProducts":true,"chooseTemplate":true,"requestSite":true,"rentsetting":{"other_tax":"1","service_tax":"12","pan_no":"abc123","tin_no":"fdfd145d"}}', '1', '2015-04-05 15:29:19', '2015-04-05 12:02:15', '0'),
(14, 2, 6, 'Amar', 'amar', 'amar@wtouch.in', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '2015-04-11', '{"address":"pune","location":"Chinchwadgaon ","city":"Pune","area":"Pune City","pincode":"411033"}', 'india', 'MAHARASHTRA', '7156465125', '', '', '', '1', '2015-04-12 21:55:21', '0000-00-00 00:00:00', '0'),
(15, 7, 3, 'manager 1', 'manager1', 'manager@wtouch.in', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '2015-04-12', '{"address":"fsafsd","location":"Chinchwadgaon ","city":"Pune","area":"Pune City","pincode":"411033"}', 'india', 'MAHARASHTRA', '7165241654', '', '', '', '1', '2015-04-13 10:46:51', '0000-00-00 00:00:00', '0'),
(17, 1, 4, 'seema', 'seema', 'seema@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1990-03-29', '{"address":"pune.","location":"(Gandhinagar) Sector 17 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '8454354545', '', '', '{"addbusiness":true,"addbusinessDetails":"68","addProducts":true,"chooseTemplate":true,"requestSite":true,"rentsetting":{"other_tax":"1","service_tax":"12","pan_no":"abc123","tin_no":"fdfd145d", "primary_edu_cess" : "2", "secondary_edu_cess" : "1"}}', '1', '2015-04-13 11:11:28', '0000-00-00 00:00:00', '0'),
(18, 3, 3, 'Smita', 'smita', 'smita@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1990-08-26', '{"address":"Deccan,Pune.","location":"(Gandhinagar) Sector 17 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '8743454545', '', '', '{"addbusiness":"false","addbusinessDetails":"false","addProducts":"false","chooseTemplate":"false","requestSite":"false"}', '1', '2015-04-13 11:15:46', '0000-00-00 00:00:00', '0'),
(19, 3, 4, 'Rahul', 'rahul', 'rahul@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1989-07-02', '{"address":"Deccan,Pune.","location":"(Gandhinagar) Sector 17 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '8743543643', '', '', '{"addbusiness":true,"addbusinessDetails":true,"addProducts":true,"chooseTemplate":false,"requestSite":false}', '1', '2015-04-13 11:19:29', '0000-00-00 00:00:00', '0'),
(20, 15, 3, 'Mahesh', 'mahesh', 'mahesh@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1988-05-01', '{"address":"Ameynagar,Ahmednagar.","location":"(Gandhinagar) Sector 17 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '7763434343', '', '', '', '1', '2015-04-13 11:21:15', '0000-00-00 00:00:00', '0'),
(21, 15, 3, 'Sarika', 'sarika', 'srk@gmail.in', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1988-01-25', '{"address":"Ahmednagar.","location":"(Gandhinagar) Sector 8 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382007"}', 'india', 'GUJARAT', '8656565656', '', '', '', '1', '2015-04-13 11:21:15', '0000-00-00 00:00:00', '0'),
(22, 15, 3, 'Anil Misal', 'anil', 'anil@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1986-08-11', '{"address":"Pune","location":"(Gandhinagar) Sector 16 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '7343434343', '', '', '', '1', '2015-04-13 11:26:35', '0000-00-00 00:00:00', '0'),
(23, 7, 4, 'Rakesh', 'rakesh', 'rk@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1988-05-03', '{"address":"Pune.","location":"(Gandhinagar) Sector 19 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382021"}', 'india', 'GUJARAT', '8657665654', '', '', '', '1', '2015-04-13 11:27:53', '0000-00-00 00:00:00', '0'),
(24, 7, 4, 'Ramesh', 'ramesh', 'ramesh@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1991-04-01', '{"address":"Nashik","location":"(Gandhinagar) Sector 16 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '8454543545', '', '', '', '1', '2015-04-13 11:32:49', '0000-00-00 00:00:00', '0'),
(25, 18, 4, 'Shital', 'shital', 'shital@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1990-10-13', '{"address":"Mumbai","location":"(Gandhinagar) Sector 22 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382021"}', 'india', 'GUJARAT', '8434344343', '', '', '{"addbusiness":false,"addbusinessDetails":false,"addProducts":false,"chooseTemplate":false,"requestSite":false}', '1', '2015-04-13 11:33:50', '0000-00-00 00:00:00', '0'),
(26, 18, 4, 'Shreya', 'shreya', 'shreya@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1991-01-26', '{"address":"Nashik","location":"15 Velampalayam ","city":"Coimbatore","area":"Tiruppur","pincode":"641652"}', 'india', 'TAMIL NADU', '7432323233', '', '', '', '1', '2015-04-13 11:35:43', '0000-00-00 00:00:00', '0'),
(28, 20, 4, 'Mihika', 'mihika', 'mihika@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1991-07-14', '{"address":"Mumbai","location":"(Gandhinagar) Sector 17 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '8843434344', '', '', '', '1', '2015-04-13 11:40:32', '0000-00-00 00:00:00', '0'),
(29, 20, 4, 'Manali', 'manali', 'manali@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '2015-04-12', '{"address":"Pune","location":"(Gandhinagar) Sector 17 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '8876343434', '', '', '', '1', '2015-04-13 11:45:20', '0000-00-00 00:00:00', '0'),
(30, 21, 4, 'Satyam', 'satyam', 'satyam@gmail.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '1992-08-02', '{"address":"Ahmednagar.","location":"(Gandhinagar) Sector 17 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382016"}', 'india', 'GUJARAT', '7588543431', '', '', '', '1', '2015-04-13 11:45:20', '0000-00-00 00:00:00', '0'),
(31, 22, 4, 'Aaditi', 'aaditi', 'aditi@gmail.com', '', '', '1997-04-28', '{"address":"Ahmednagar.","location":"(Gandhinagar) Sector 8 ","city":"Gandhi Nagar","area":"Gandhinagar","pincode":"382007"}', 'india', 'GUJARAT', '8565656565', '', '', '', '0', '2015-04-13 11:51:56', '0000-00-00 00:00:00', '0'),
(34, 1, 4, 'asadsad', 'amarnatha', 'amarnathayan_k@yahoo.com', '$2a$10$5499370643f50ae40399eOPhNX6sDL4axaq9In1tf3J3KDQoeUhpi', '', '2015-04-19', '{"address":"vjngnsigtu y[","location":"Aurad (B) ","city":"Bidar","area":"Aurad (b)","pincode":"585326"}', 'india', 'KARNATAKA', '9825252525', '123', 'http://www.google.com', '', '1', '2015-04-20 20:22:29', '2015-04-20 17:04:04', '0'),
(35, 1, 4, 'pooja', 'pooja', 'pooja@gmail.com', '$2a$10$92445f9fb3cbcc950741bOVBjdcm3xR72Aljt7WrFZSuT95jgvcJ2', '', '2015-04-06', '{"pincode":"414001","address":"At- khadki, Post -Khandala,\\nTal\\/Dist- A''nagar.","location":"Ahmednagar City ","city":"Ahmed Nagar","area":"Ahmednagar"}', 'india', 'MAHARASHTRA', '8978978978', '79', 'http://google.com', '', '0', '2015-04-21 10:04:27', '0000-00-00 00:00:00', '0'),
(36, 1, 4, 'sunita23', 'omsai', 'sunitakarle23@gmail.com', '$2a$10$b5028be34d6604213949eOmxqwV5NYdsq.FtzZJEaeEknjTgefhR2', '', '1991-06-22', '{"address":"pune","location":"Kedgaon  (Pune)","city":"Pune","area":"Daund","pincode":"412203"}', 'india', 'MAHARASHTRA', '8944555555', '', '', '{"addbusiness":false,"addbusinessDetails":false,"addProducts":false,"chooseTemplate":false,"requestSite":false}', '1', '2015-04-21 11:23:54', '2015-04-21 08:00:34', '0'),
(37, 1, 4, 'sunita', 'sai', 'sunita@wtouch.in', '', '', '1991-06-22', '{"location":"Airport  (Pune)","city":"Pune","area":"Pune City","pincode":"411032","address":"ahmednager"}', 'india', 'MAHARASHTRA', '7885554455', '', '', '', '0', '2015-04-21 16:16:18', '0000-00-00 00:00:00', '0'),
(38, 1, 4, 'Vilas Shetkar', 'shetkar', 'admin@wtouch.in', '$2a$10$20ca02be07c1c97434a2eOCe3i23eiGhoHvCgXDdgwI3l1FMYXbA6', '', '2015-04-20', '{"address":"dsfsd","location":"Chinchwadgaon ","city":"Pune","area":"Pune City","pincode":"411033"}', 'india', 'MAHARASHTRA', '7165416546', '', '', '', '0', '2015-04-21 15:27:55', '0000-00-00 00:00:00', '0'),
(44, 1, 2, 'person', 'newusr', 'neeta@wtouch.in', '', '', '2015-04-22', '{"location":"Chinchwadgaon ","city":"Pune","area":"Pune City","pincode":"411033","address":"fsdafsd"}', 'india', 'MAHARASHTRA', '7613165456', '', '', '', '1', '2015-04-23 12:26:49', '0000-00-00 00:00:00', '0'),
(45, 1, 4, 'Pranita', 'pranita', 'pranita@gmail.com', '', '', '2015-04-05', '{"address":"Pune","location":"Ahmedabad ","city":"Ananthnag","area":"Ahmedbad","pincode":"193303"}', 'india', 'JAMMU & KASHMIR', '8856555656', '', '', '', '0', '2015-04-23 17:23:04', '0000-00-00 00:00:00', '0'),
(46, 1, 4, 'Gaury', 'gaury', 'gaury@gmail.com', '$2a$10$a9dda39a74037caaa8b54ucnJw4fN8wg.QVMe6kFv5hbuMzK.RJbO', '', '1990-08-06', '{"address":"Pune","location":"Airport  (Pune)","city":"Pune","area":"Pune City","pincode":"411032"}', 'india', 'MAHARASHTRA', '8843323423', '43434234', 'http://wtouch.in', '', '0', '2015-04-23 18:01:25', '0000-00-00 00:00:00', '0'),
(47, 1, 4, 'shyam', 'shyam', 'shyam@wtouch.in', '$2a$10$03b0985b16e6640a509b6uCH47SIsO5niEXn.Gjt/f/hkeLkVe9ji', '', '1988-11-13', '{"address":"pune","location":"Peth  (Pune)","city":"Pune","area":"Khed","pincode":"410512"}', 'india', 'MAHARASHTRA', '8855812136', '4545', 'http://palashsoft.in', '', '0', '2015-04-24 13:13:30', '0000-00-00 00:00:00', '0'),
(48, 1, 4, 'vilas', 'sunita23', 'sunitakarle@gmail.com', '$2a$10$2ad927d60244ba8986fedOzrHI5f4cjvDu6SCWFQrEuSgdqXj2Dde', '', '1982-05-03', '{"address":"Pune","location":"Airport  (Pune)","city":"Pune","area":"Pune City","pincode":"411032"}', 'india', 'MAHARASHTRA', '7845555454', '444444', 'http://wtouch.in', '', '0', '2015-04-24 16:59:12', '0000-00-00 00:00:00', '0'),
(52, 1, 4, 'Yogesh', 'yogeshcool', 'yogesh@wtouch.in', '$2a$10$74c2e995e3df13a5a0b6bu6DSTjm26MbgVu9dm5ZEiMC8iQOfp4Om', '', '1990-02-27', '{"address":"chinchwad","location":"Chinchwadgaon ","city":"Pune","area":"Pune City","pincode":"411033"}', 'india', 'MAHARASHTRA', '9090989890', '', '', '{"addbusiness":false,"addbusinessDetails":false,"addProducts":false,"chooseTemplate":false,"requestSite":false}', '1', '2015-04-28 19:44:48', '2015-04-28 16:29:07', '0'),
(53, 1, 4, 'darling', 'Computer', 'yogkulkarni2010@gmail.com', '64fb003346e417480e1d1c83bc85cb2b', '', '1990-02-27', '{"address":"chinchwad","location":"Chinchwadgaon ","city":"Pune","area":"Pune City","pincode":"411033"}', 'india', 'MAHARASHTRA', '7877878787', '', '', '', '0', '2015-04-28 19:59:06', '0000-00-00 00:00:00', '0'),
(56, 1, 4, 'darling', 'Computerf', 'yogdf@fjdh.sdf', '$2a$10$7344011f41b04d9b96719OeTn61CK5/C5.eQZmjC94RpftoXI9yR.', '', '1990-02-27', '{"address":"chinchwad","location":"Chinchwadgaon ","city":"Pune","area":"Pune City","pincode":"411033"}', 'india', 'MAHARASHTRA', '7877878787', '', '', '', '0', '2015-04-28 19:59:06', '0000-00-00 00:00:00', '0'),
(58, 1, 4, 'darling', 'vilass', 'vilasshe@wtouch.in', '$2a$10$734f069c9b529c049e20dO62KWdwAL4uMtbaUxyhE/CufH.v1y1gq', '', '1990-02-27', '{"address":"chinchwad","location":"Chinchwadgaon ","city":"Pune","area":"Pune City","pincode":"411033"}', 'india', 'MAHARASHTRA', '7877878787', '', 'http://fdf', '', '0', '2015-04-28 19:59:06', '0000-00-00 00:00:00', '0'),
(59, 1, 4, 'yogu', 'yogu8983', 'yogucool8310@rediffmail.com', '$2a$10$fe5a6b42b1c48b2203fc1upxvOX0sLlyNs3RHz52.qypq0EvxWHs.', '', '1990-04-16', '{"address":"pune","location":"Pune H.O","city":"Pune","area":"Pune City","pincode":"411001"}', 'india', 'MAHARASHTRA', '8983133103', '', '', '{"addbusiness":true,"addbusinessDetails":true,"addProducts":true,"chooseTemplate":true,"requestSite":true}', '1', '2015-04-29 13:34:03', '0000-00-00 00:00:00', '0'),
(86, 1, 4, 'Vilas Shetkar', 'vilassh', 'vilasshetkar@gmail.com', '$2a$10$b5a1d0eb695ab693288b8eufGfajBjzVwBAI9TUBnvgoydRdPKrGa', '', '2015-04-28', '{"address":"fdsafsd","location":"Chinchwadgaon ","city":"Pune","area":"Pune City","pincode":"411033"}', 'india', 'MAHARASHTRA', '7165465654', '', '', '{"addbusiness":false,"addbusinessDetails":false,"addProducts":false,"chooseTemplate":false,"requestSite":false}', '1', '2015-04-29 15:18:25', '2015-04-29 17:37:14', '0'),
(87, 1, 1, 'Dnyaneshwar', 'dshetkar', 'jsdhfh@jhd.com', '', '', '0000-00-00', '{"address":"gfhghgf","location":"ghgfhgfhgf","area":"ghdg","state":"ghh","city":"gfhd","pincode":"784415"}', 'ghghgf', '', '9544556555', '', '', '', '0', '2015-06-07 10:31:31', '0000-00-00 00:00:00', '0'),
(88, 1, 4, 'Amar Kalyane', 'kalyaneamar', 'kalyaneamar136@gmail.com', '$2a$10$c4c55e5e97631021d54c5ugNFDpXrxQpbBp0SiKokaq5sX0PeY7h.', '', '1993-12-19', '{"address":"Shree Nagar Ambika Colony","pincode":"411017"}', '', '', '9175570771', '545454564554', 'http://www.kalyane.com', '', '0', '2015-06-07 11:14:13', '0000-00-00 00:00:00', '0'),
(89, 1, 4, 'Dnyaneshwar', 'sonali', 'dshetkar@wtouch.in', '$2a$10$6883c781d291070b48771udwaGhiPDIvi96MJhqgPMCJj0VNkoI4a', '/uploads/user/profile/89/IMG-20150320-WA0013 (FILEminimizer).jpg', '2015-06-07', '{"address":"fsdfjasdfh","location":"dsfads","area":"dsfadsf","city":"dsfdsf","pincode":"656546"}', 'dsfadsf', 'dsfadsf', '9879865456', '546545456456', 'http://www.google.com', '{"rentsetting":{"service_tax":"14","other_tax":0,"primary_edu_cess":"1","secondary_edu_cess":"2","tds":0,"pan_no":"gfg","service_tax_no":0}}', '1', '2015-06-07 11:35:02', '0000-00-00 00:00:00', '0'),
(90, 89, 4, 'Vilas', 'baludada', 'balu@kjf', '', '', '2015-06-08', '{"address":"sfdkjdf","location":"gsdfg","area":"fdgfd","city":"fdgfdg","pincode":"435612"}', 'fdg', 'fdgfd', '9854655545', '', '', '', '1', '2015-06-07 16:59:37', '0000-00-00 00:00:00', '0'),
(91, 89, 4, 'Amar Kalyane', 'amarbhau', 'amar5@wtouch.in', '', '', '2015-06-15', '{"address":"ehgghgf","location":"gfhdg","area":"ghd","city":"dgh","pincode":"554654"}', 'gdhdg', 'gfh', '9465456456', '', '', '', '0', '2015-06-07 18:34:39', '0000-00-00 00:00:00', '0'),
(92, 1, 4, 'Dnyaneshwar Shetkar', 'dnyaneshwar', 'dnyaneshwar@wtouch.in', '$2a$10$87712f5b1c5cb85dde23cOHazLtERzvphfePEZQiSuH8N8kdjG/.y', '', '1992-12-31', '{"address":"Hanegaon","location":"Bazar Line Hanegaon.","area":"Hanegaon","city":"Nanded","pincode":"431741"}', 'India', 'Maharashtra', '9175570771', '5454564', 'http://www.google.com', '', '0', '2015-06-07 18:52:02', '0000-00-00 00:00:00', '0');

-- --------------------------------------------------------

--
-- Table structure for table `user_group`
--

DROP TABLE IF EXISTS `user_group`;
CREATE TABLE IF NOT EXISTS `user_group` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(256) NOT NULL,
  `group_description` varchar(256) NOT NULL,
  `group_permission` longtext NOT NULL,
  `config` longtext NOT NULL,
  `status` enum('1','0') NOT NULL DEFAULT '1',
  `date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `user_group`
--

INSERT INTO `user_group` (`id`, `group_name`, `group_description`, `group_permission`, `config`, `status`, `date`, `modified_date`) VALUES
(1, 'superadmin', 'super admin user', '{"user_module":{"add_user":true,"ban_user":true,"delete_user":true,"edit_user":true,"user_list":true,"activate_user":true,"add_group":true,"assign_user_group":true,"edit_group":true,"reset_user_password":true},"group_access":{"admin":true,"customer":true,"manager":true,"salesman":true},"template_module":{"add_template":true,"delete_template":true,"edit_template":true,"my_template":true,"request_custom_template":true,"template_list":true,"Make_Private":true,"assign_to_developer":true,"filter_by_developer":true,"filter_by_development_status":true,"publish_template":true,"rate_template":true,"set_template_price":true},"business_module":{"add_business":true,"approve_business":true,"business_list":true,"delete_business":true,"edit_business":true,"featured_business":true,"verify_business":true,"filter_by_customer":true},"website_module":{"change_settings":true,"customer_filter":true,"edit_domain":true,"expiry":true,"manage_domain":true,"publish_domain":true,"reject_domain":true,"renew":true,"requested_sites":true,"request_site":true,"validity_filter":true,"website_list":true},"product_module":{"add_product":true,"delete_product":true,"edit_product":true,"featured_product":true,"product_list":true,"reorder_products":true},"enquiry_module":{"Delete Mail":true,"all_enquiries":true,"filter_by_category":true,"filter_by_type":true,"filter_by_user":true,"search_enquiries":true},"dashboard":{"create_moddule_widget":true,"create_statistics_widget":true,"default_widgets":true,"manage_widgets":true}}', '{"config":true,"config2":true}', '1', '2015-03-20 10:47:25', '0000-00-00 00:00:00'),
(2, 'salesman', 'have authority to add business', '{"user_module":{"add_user":true,"edit_user":true,"ban_user":true,"user_list":true},"group_access":{"customer":true,"salesman":true,"manager":false},"template_module":{"template_list":true,"my_template":true,"request_custom_template":true,"rate_template":true},"business_module":{"add_business":true,"approve_business":true,"business_list":true,"delete_business":true,"edit_business":true},"website_module":{"change_settings":true,"customer_filter":true,"website_list":true,"request_site":true}}', '{}', '1', '2015-03-21 18:30:30', '0000-00-00 00:00:00'),
(3, 'manager', 'have authority to add template', '{"user_module":{"add_user":true,"ban_user":true,"delete_user":true,"activate_user":true,"edit_user":true,"user_list":true,"reset_user_password":true},"group_access":{"manager":true,"customer":true,"salesman":true},"template_module":{"template_list":true,"rate_template":true,"my_template":true,"request_custom_template":true},"business_module":{"add_business":true,"edit_business":true,"approve_business":true,"verify_business":true,"filter_by_customer":true,"business_list":true,"delete_business":true},"website_module":{"change_settings":true,"customer_filter":true,"request_site":true,"requested_sites":true,"validity_filter":true,"website_list":true}}', '{}', '1', '2015-03-21 18:35:25', '0000-00-00 00:00:00'),
(4, 'customer', 'customer is last in hierarchy of user list', '{"user_module":{"edit_user":false,"delete_user":false,"ban_user":false,"add_user":false,"user_list":false,"activate_user":false},"group_access":{"admin":false,"customer":true,"manager":false},"template_module":{"Make_Private":true,"filter_by_development_status":true,"request_custom_template":true,"my_template":true,"template_list":true},"business_module":{"add_business":true,"business_list":true,"delete_business":true,"edit_business":true},"website_module":{"change_settings":true,"validity_filter":true,"requested_sites":true,"request_site":true,"renew":true,"website_list":true}}', '{}', '1', '2015-03-21 18:43:41', '0000-00-00 00:00:00'),
(5, 'admin', 'this is super admin group', '{"user_module":{"delete_user":true,"edit_user":true,"activate_user":true,"ban_user":true,"reset_user_password":true,"add_group":true,"user_list":true,"add_user":true,"edit_group":true},"group_access":{"admin":true,"customer":true,"manager":true,"salesman":true},"template_module":{"Make_Private":true,"my_template":true,"set_template_price":true,"add_template":true,"edit_template":true,"publish_template":true,"template_list":true,"rate_template":true,"filter_by_developer":true,"assign_to_developer":true,"delete_template":true,"filter_by_development_status":true,"request_custom_template":true},"business_module":{"add_business":true,"edit_business":true,"approve_business":true,"featured_business":true,"business_list":true,"filter_by_customer":true,"delete_business":true,"verify_business":true},"website_module":{"change_settings":true,"renew":true,"customer_filter":true,"manage_domain":true,"request_site":true,"requested_sites":true,"publish_domain":true,"edit_domain":true,"expiry":true,"reject_domain":true,"validity_filter":true,"website_list":true}}', '{}', '1', '2015-03-27 20:47:35', '0000-00-00 00:00:00');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
