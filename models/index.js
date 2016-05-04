var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/wikistack');

var generateUrl = function (title) {
  if (title) {
    // Removes all non-alphanumeric characters from title
    // And make whitespace underscore
    return title.replace(/\s+/g, '_').replace(/\W/g, '');
  } else {
    // Generates random 5 letter string
    return Math.random().toString(36).substring(2, 7);
  }
};

//db.define takes 3 arguments
//1. name of database
//2. actual database fields
//3. options
var Page = db.define('page', {
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            urlTitle: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('open', 'closed')
            },
            date: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            tags: {
                type: Sequelize.ARRAY(Sequelize.TEXT),
                set: function(val) {
                    console.log(val);
                    this.setDataValue('tags', val.split(" "));
                    console.log(this.tags);

                }

            }
        }, {
            getterMethods: {
                route: function() {
                    return '/wiki/' + this.urlTitle;
                }
            },
            classMethods : {
                findByTag: function(tagName) {
                    return this.findAll({
                        where: {
                            tags: {
                                $overlap: [tagName]
                            }
                        }
                    });
                }
             }
        });

Page.hook('beforeValidate', function(page, options) {
    page.urlTitle = generateUrl(page.title);
    //page.tags = page.tags.split(" ");
});




var User = db.define('user', {
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                isEmail: true
            }
        });

        module.exports = {
            Page: Page,
            User: User
        };

Page.belongsTo(User, { as: 'author' });
